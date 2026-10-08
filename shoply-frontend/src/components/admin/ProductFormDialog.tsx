import { ImagePlus, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/shop/AuthCard";
import { FieldError } from "@/components/shop/common";
import { categories, type Product } from "@/lib/data";
import { useStore } from "@/lib/store";
import { validate, type FieldErrors } from "@/lib/validate";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  tagline: z.string().trim().min(2, "Short tagline is required").max(80),
  price: z.coerce.number({ invalid_type_error: "Enter a price" }).positive("Must be greater than 0").max(100000),
  stock: z.coerce.number({ invalid_type_error: "Enter stock" }).int("Whole number").min(0, "Cannot be negative"),
  categoryId: z.string().min(1, "Choose a category"),
  description: z.string().trim().min(10, "At least 10 characters").max(2000),
  image: z.string().min(1, "Add a product image"),
});

type Form = { name: string; tagline: string; price: string; stock: string; categoryId: string; description: string; image: string };
const empty: Form = { name: "", tagline: "", price: "", stock: "", categoryId: "", description: "", image: "" };

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function ProductFormDialog({ open, onOpenChange, product }: { open: boolean; onOpenChange: (o: boolean) => void; product: Product | null }) {
  const { saveProduct, products } = useStore();
  const [f, setF] = useState<Form>(empty);
  const [errors, setErrors] = useState<FieldErrors<keyof Form>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setF(product ? { name: product.name, tagline: product.tagline, price: String(product.price), stock: String(product.stock), categoryId: product.categoryId, description: product.description, image: product.images[0] ?? "" } : empty);
  }, [open, product]);

  const set = (k: keyof Form) => (v: string) => setF((x) => ({ ...x, [k]: v }));

  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return void toast.error("Please choose an image file");
    if (file.size > 1.5 * 1024 * 1024) return void toast.error("Image must be under 1.5 MB");
    const reader = new FileReader();
    reader.onload = () => set("image")(String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = validate(schema, f);
    if (!r.ok) return setErrors(r.errors);
    setBusy(true);
    setTimeout(() => {
      const d = r.data;
      let id = product?.id ?? slug(d.name);
      if (!product) while (products.some((p) => p.id === id)) id = `${slug(d.name)}-${Math.floor(Math.random() * 1000)}`;
      const images = product ? [d.image, ...product.images.slice(1).filter((i) => i !== d.image)] : [d.image];
      saveProduct({
        ...(product ?? { rating: 0, reviews: 0, sold: 0 }),
        id, name: d.name, tagline: d.tagline, price: d.price, stock: d.stock, categoryId: d.categoryId, description: d.description, images,
      });
      setBusy(false);
      toast.success(product ? `${d.name} updated` : `${d.name} created`);
      onOpenChange(false);
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-2xl">
        <DialogHeader><DialogTitle className="font-display text-2xl">{product ? "Edit product" : "New product"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-[180px_1fr]">
          <div>
            <Label>Image</Label>
            <label className="glass mt-1.5 grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-2xl">
              {f.image ? <img src={f.image} alt="" className="size-full object-cover" /> : <span className="flex flex-col items-center gap-2 text-xs text-muted-foreground"><ImagePlus className="size-6" /> Upload</span>}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            <Input placeholder="…or paste image URL" value={f.image.startsWith("data:") ? "" : f.image} onChange={(e) => set("image")(e.target.value)} className="mt-2 h-9 rounded-xl text-xs" />
            <FieldError msg={errors.image} />
          </div>
          <div className="space-y-4">
            <Field label="Name" name="name" value={f.name} onChange={set("name")} error={errors.name} />
            <Field label="Tagline" name="tagline" value={f.tagline} onChange={set("tagline")} error={errors.tagline} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price (USD)" name="price" type="number" value={f.price} onChange={set("price")} error={errors.price} />
              <Field label="Stock" name="stock" type="number" value={f.stock} onChange={set("stock")} error={errors.stock} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={f.categoryId} onValueChange={set("categoryId")}>
                <SelectTrigger className="mt-1.5 h-11 rounded-xl bg-card/70"><SelectValue placeholder="Choose category" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              <FieldError msg={errors.categoryId} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} value={f.description} onChange={(e) => set("description")(e.target.value)} className="mt-1.5 rounded-xl bg-card/70" />
              <FieldError msg={errors.description} />
            </div>
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="hero" disabled={busy}>{busy && <Loader2 className="animate-spin" />} {product ? "Save changes" : "Create product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
