import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Heart, PackageX, ShieldCheck, Star, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/shop/ProductCard";
import { EmptyState, QuantitySelector, Section } from "@/components/shop/common";
import { formatPrice, getCategory, getProduct as getSeedProduct } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products/$id")({
  head: ({ params }) => {
    const p = getSeedProduct(params.id);
    const title = p ? `${p.name} — Shoply` : "Product — Shoply";
    const desc = p ? `${p.tagline}. ${p.description.slice(0, 120)}` : "Product details at Shoply.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { products, getProduct, addToCart, toggleWishlist, inWishlist, hydrated } = useStore();
  const p = getProduct(id);
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  useEffect(() => { setImg(0); setQty(1); }, [id]);

  if (!p && !hydrated)
    return (
      <Section>
        <div className="grid gap-10 lg:grid-cols-2"><Skeleton className="aspect-square rounded-3xl" /><div className="space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-6 w-1/3" /><Skeleton className="h-32 w-full" /></div></div>
      </Section>
    );
  if (!p)
    return (
      <Section className="py-20">
        <EmptyState icon={PackageX} title="Product not found" text="This product may have been removed or the link is incorrect." action={<Button asChild variant="hero"><Link to="/products">Back to shop</Link></Button>} />
      </Section>
    );

  const related = products.filter((x) => x.categoryId === p.categoryId && x.id !== p.id).slice(0, 4);
  const saved = inWishlist(p.id);
  const stock = p.stock === 0 ? { label: "Out of stock", cls: "text-destructive" } : p.stock < 10 ? { label: `Only ${p.stock} left`, cls: "text-warning" } : { label: "In stock", cls: "text-success" };
  const category = getCategory(p.categoryId);

  return (
    <>
      <Section>
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link to="/products" className="hover:text-primary">Shop</Link> / <Link to="/products" search={{ category: p.categoryId }} className="hover:text-primary">{category?.name}</Link> / <span className="text-foreground">{p.name}</span>
        </nav>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="glass-card overflow-hidden p-3">
              <img src={p.images[img] ?? p.images[0]} alt={p.name} width={800} height={800} className="aspect-square w-full rounded-2xl object-cover" />
            </div>
            {p.images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {p.images.map((src, i) => (
                  <button key={i} onClick={() => setImg(i)} className={cn("size-20 overflow-hidden rounded-2xl border-2 transition", i === img ? "border-primary" : "border-transparent opacity-70 hover:opacity-100")}>
                    <img src={src} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="lg:pt-4">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">{category?.name}</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">{p.name}</h1>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="size-4 fill-warning text-warning" /> {p.rating} · {p.reviews} reviews
            </div>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold">{formatPrice(p.price)}</span>
              {p.compareAt && <span className="text-lg text-muted-foreground line-through">{formatPrice(p.compareAt)}</span>}
            </div>
            <p className={cn("mt-3 flex items-center gap-1.5 text-sm font-semibold", stock.cls)}>
              <span className="size-2 rounded-full bg-current" /> {stock.label}
            </p>
            <p className="mt-6 leading-relaxed text-muted-foreground">{p.description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <QuantitySelector value={qty} onChange={setQty} max={Math.max(1, p.stock)} />
              <Button variant="hero" size="lg" className="flex-1" disabled={p.stock === 0} onClick={() => addToCart(p, qty)}>
                {p.stock === 0 ? "Sold out" : "Add to bag"}
              </Button>
              <Button variant="glass" size="lg" onClick={() => toggleWishlist(p)} aria-label="Wishlist">
                <Heart className={cn(saved && "fill-primary text-primary")} /> {saved ? "Saved" : "Wishlist"}
              </Button>
            </div>
            <ul className="glass-card mt-8 space-y-3 p-5 text-sm">
              <li className="flex items-center gap-3"><Truck className="size-4 text-primary" /> Free shipping on orders over $75</li>
              <li className="flex items-center gap-3"><Check className="size-4 text-primary" /> 30-day free returns</li>
              <li className="flex items-center gap-3"><ShieldCheck className="size-4 text-primary" /> 2-year quality guarantee</li>
            </ul>
          </div>
        </div>
      </Section>
      {related.length > 0 && (
        <Section>
          <h2 className="text-2xl font-bold tracking-tight">You may also like</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{related.map((r) => <ProductCard key={r.id} product={r} />)}</div>
        </Section>
      )}
    </>
  );
}
