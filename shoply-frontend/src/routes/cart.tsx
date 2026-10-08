import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageTitle, QuantitySelector, Section } from "@/components/shop/common";
import { OrderSummary } from "@/components/shop/OrderSummary";
import { formatPrice } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your bag — Shoply" },
      { name: "description", content: "Review the items in your Shoply bag and proceed to checkout." },
      { property: "og:title", content: "Your bag — Shoply" },
      { property: "og:description", content: "Review your bag and check out." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cartLines, setQty, removeFromCart } = useStore();
  if (cartLines.length === 0)
    return (
      <Section className="py-20">
        <EmptyState icon={ShoppingBag} title="Your bag is empty" text="Looks like you haven't added anything yet." action={<Button asChild variant="hero"><Link to="/products">Start shopping</Link></Button>} />
      </Section>
    );
  return (
    <Section>
      <PageTitle title="Your bag" subtitle={`${cartLines.length} item${cartLines.length > 1 ? "s" : ""}`} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          {cartLines.map(({ product: p, quantity }) => (
            <li key={p.id} className="glass-card flex flex-wrap items-center gap-5 p-4 sm:flex-nowrap">
              <img src={p.images[0]} alt={p.name} className="size-24 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <Link to="/products/$id" params={{ id: p.id }} className="font-semibold hover:text-primary">{p.name}</Link>
                <p className="text-sm text-muted-foreground">{p.tagline}</p>
                <p className="mt-1 text-sm font-medium">{formatPrice(p.price)}</p>
              </div>
              <QuantitySelector value={quantity} onChange={(n) => setQty(p.id, n)} max={p.stock} />
              <span className="w-20 text-right font-display font-bold">{formatPrice(p.price * quantity)}</span>
              <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => removeFromCart(p.id)}><Trash2 /></Button>
            </li>
          ))}
        </ul>
        <OrderSummary>
          <Button asChild variant="hero" size="lg" className="w-full"><Link to="/checkout">Proceed to checkout</Link></Button>
          <Button asChild variant="link" className="mt-2 w-full"><Link to="/products">Continue shopping</Link></Button>
        </OrderSummary>
      </div>
    </Section>
  );
}
