import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageTitle, Section } from "@/components/shop/common";
import { formatPrice } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Shoply" },
      { name: "description", content: "Products you've saved for later at Shoply." },
      { property: "og:title", content: "Wishlist — Shoply" },
      { property: "og:description", content: "Your saved Shoply products." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, getProduct, moveToCart, toggleWishlist } = useStore();
  const items = wishlist.flatMap((id) => {
    const p = getProduct(id);
    return p ? [p] : [];
  });
  if (items.length === 0)
    return (
      <Section className="py-20">
        <EmptyState icon={Heart} title="Your wishlist is empty" text="Tap the heart on any product to save it here." action={<Button asChild variant="hero"><Link to="/products">Discover products</Link></Button>} />
      </Section>
    );
  return (
    <Section>
      <PageTitle title="Wishlist" subtitle={`${items.length} saved`} />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <div key={p.id} className="glass-card overflow-hidden">
            <Link to="/products/$id" params={{ id: p.id }}><img src={p.images[0]} alt={p.name} className="aspect-square w-full object-cover" /></Link>
            <div className="p-5">
              <h3 className="font-sans font-semibold">{p.name}</h3>
              <p className="mt-1 font-display font-bold">{formatPrice(p.price)}</p>
              <div className="mt-4 flex gap-2">
                <Button variant="hero" size="sm" className="flex-1" disabled={p.stock === 0} onClick={() => moveToCart(p)}>
                  <ShoppingBag /> {p.stock === 0 ? "Sold out" : "Move to bag"}
                </Button>
                <Button variant="glass" size="icon" className="size-8" aria-label="Remove" onClick={() => toggleWishlist(p)}><Trash2 /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
