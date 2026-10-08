import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CreditCard, Loader2, ShoppingBag } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/shop/AuthCard";
import { EmptyState, PageTitle, Section } from "@/components/shop/common";
import { OrderSummary } from "@/components/shop/OrderSummary";
import { shippingFor } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ordersApi } from "@/lib/api";
import { validate, type FieldErrors } from "@/lib/validate";

const base = {
  name: z.string().trim().min(2, "Required"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(7, "Enter a valid phone"),
  address: z.string().trim().min(4, "Required"),
  city: z.string().trim().min(2, "Required"),
  zip: z.string().trim().regex(/^[A-Za-z0-9 -]{3,10}$/, "Invalid postal code"),
  country: z.string().trim().min(2, "Required"),
};
const cardSchema = z.object({
  ...base,
  card: z.string().regex(/^\d{16}$/, "16 digits, no spaces"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "MM/YY"),
  cvc: z.string().regex(/^\d{3,4}$/, "3–4 digits"),
});
const codSchema = z.object(base);

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Shoply" },
      { name: "description", content: "Complete your Shoply order securely." },
      { property: "og:title", content: "Checkout — Shoply" },
      { property: "og:description", content: "Complete your Shoply order." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { cartLines, subtotal, user, placeOrder, clearCart, hydrated, apiMode } = useStore();
  const navigate = useNavigate();
  const [method, setMethod] = useState<"card" | "cod">("card");
  const [f, setF] = useState({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "", address: "", city: "", zip: "", country: "United States", card: "", expiry: "", cvc: "" });
  const [errors, setErrors] = useState<FieldErrors<keyof typeof f>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });

  if (hydrated && cartLines.length === 0 && !busy)
    return (
      <Section className="py-20">
        <EmptyState icon={ShoppingBag} title="Nothing to check out" text="Add a few products to your bag first." action={<Button asChild variant="hero"><Link to="/products">Shop now</Link></Button>} />
      </Section>
    );

  const place = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = validate(method === "card" ? cardSchema : codSchema, f);
    if (!r.ok) {
      setErrors(r.errors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      if (apiMode) {
        const order = await ordersApi.place({
          customer_name: f.name,
          customer_email: f.email,
          address: `${f.address}, ${f.city} ${f.zip}, ${f.country}`,
          items: cartLines.map(({ product, quantity }) => ({ productId: product.id, quantity })),
        });
        toast.success(`Order ${order.id} placed — thank you!`);
        clearCart();
        navigate({ to: "/order-confirmation/$id", params: { id: order.id }, replace: true });
      } else {
        await new Promise((res) => setTimeout(res, 900));
        const id = `SH-${10432 + Math.floor(Math.random() * 9000)}`;
        const ship = shippingFor(subtotal);
        placeOrder({
          id, date: new Date().toISOString().slice(0, 10), customer: f.name, email: f.email, status: "Pending", shipping: ship, total: subtotal + ship,
          address: `${f.address}, ${f.city} ${f.zip}, ${f.country}`,
          items: cartLines.map(({ product, quantity }) => ({ productId: product.id, name: product.name, price: product.price, quantity, image: product.images[0] ?? "" })),
        });
        toast.success(`Order ${id} placed — thank you!`);
        navigate({ to: "/order-confirmation/$id", params: { id }, replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section>
      <PageTitle title="Checkout" subtitle={user ? undefined : "Checking out as a guest — sign in to see this order in your account later."} />
      <form onSubmit={place} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card title="1. Customer information">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="name" value={f.name} onChange={set("name")} error={errors.name} />
              <Field label="Email" name="email" type="email" value={f.email} onChange={set("email")} error={errors.email} />
              <Field label="Phone" name="phone" value={f.phone} onChange={set("phone")} error={errors.phone} />
            </div>
          </Card>
          <Card title="2. Shipping address">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Field label="Street address" name="address" value={f.address} onChange={set("address")} error={errors.address} /></div>
              <Field label="City" name="city" value={f.city} onChange={set("city")} error={errors.city} />
              <Field label="Postal code" name="zip" value={f.zip} onChange={set("zip")} error={errors.zip} />
              <Field label="Country" name="country" value={f.country} onChange={set("country")} error={errors.country} />
            </div>
          </Card>
          <Card title="3. Payment">
            <RadioGroup value={method} onValueChange={(v) => setMethod(v === "cod" ? "cod" : "card")} className="grid gap-3 sm:grid-cols-2">
              <Label className="glass flex cursor-pointer items-center gap-3 rounded-2xl p-4"><RadioGroupItem value="card" /> <CreditCard className="size-4" /> Credit / debit card</Label>
              <Label className="glass flex cursor-pointer items-center gap-3 rounded-2xl p-4"><RadioGroupItem value="cod" /> Cash on delivery</Label>
            </RadioGroup>
            {method === "card" && (
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-3"><Field label="Card number" name="card" value={f.card} onChange={(v) => set("card")(v.replace(/\D/g, "").slice(0, 16))} error={errors.card} placeholder="4242424242424242" /></div>
                <Field label="Expiry" name="expiry" value={f.expiry} onChange={set("expiry")} error={errors.expiry} placeholder="MM/YY" />
                <Field label="CVC" name="cvc" value={f.cvc} onChange={set("cvc")} error={errors.cvc} placeholder="123" />
              </div>
            )}
            <p className="mt-4 text-xs text-muted-foreground">Demo only — no real payment is processed.</p>
          </Card>
        </div>
        <OrderSummary showItems>
          <Button variant="hero" size="lg" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Place order</Button>
        </OrderSummary>
      </form>
    </Section>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="glass-card p-6">
      <h2 className="mb-5 text-lg font-bold">{title}</h2>
      {children}
    </div>
  );
}
