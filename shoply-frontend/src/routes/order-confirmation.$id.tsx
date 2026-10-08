import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, Section } from "@/components/shop/common";
import { OrderItemsAndSummary } from "@/components/shop/OrderDetail";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/order-confirmation/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.id} confirmed — Shoply` },
      { name: "description", content: "Thanks for your order. Here is your Shoply order confirmation." },
      { property: "og:title", content: "Order confirmed — Shoply" },
      { property: "og:description", content: "Your Shoply order confirmation." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { id } = Route.useParams();
  const { allOrders, hydrated, user } = useStore();
  const o = allOrders.find((x) => x.id === id);
  if (!hydrated) return <Section><Skeleton className="h-64 w-full rounded-3xl" /></Section>;
  if (!o)
    return (
      <Section className="py-20">
        <EmptyState icon={PackageX} title="Order not found" text="We couldn't find this order." action={<Button asChild variant="hero"><Link to="/products">Keep shopping</Link></Button>} />
      </Section>
    );
  return (
    <Section>
      <div className="glass-card mx-auto mb-8 max-w-2xl p-10 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-success/15 text-success"><CheckCircle2 className="size-8" /></div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">Thank you, {o.customer.split(" ")[0]}!</h1>
        <p className="mt-2 text-muted-foreground">Order <strong className="text-foreground">{o.id}</strong> is confirmed. A receipt was sent to {o.email}.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {user && user.email.toLowerCase() === o.email.toLowerCase() && (
            <Button asChild variant="hero"><Link to="/account/orders/$id" params={{ id: o.id }}>Track order</Link></Button>
          )}
          <Button asChild variant="glass"><Link to="/products">Continue shopping</Link></Button>
        </div>
      </div>
      <OrderItemsAndSummary order={o} />
    </Section>
  );
}
