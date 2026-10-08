import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Section, StatusBadge } from "@/components/shop/common";
import { OrderItemsAndSummary, OrderProgress } from "@/components/shop/OrderDetail";
import { RequireAuth } from "@/components/shop/RequireAuth";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/account/orders/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.id} — Shoply` },
      { name: "description", content: "Order details and delivery status." },
      { property: "og:title", content: `Order ${params.id} — Shoply` },
      { property: "og:description", content: "Order details and delivery status." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <RequireAuth><OrderPage /></RequireAuth>,
});

function OrderPage() {
  const { id } = Route.useParams();
  const { myOrders } = useStore();
  const o = myOrders.find((x) => x.id === id);
  if (!o)
    return (
      <Section className="py-20">
        <EmptyState icon={PackageX} title="Order not found" text="We couldn't find this order on your account." action={<Button asChild variant="hero"><Link to="/account">Back to account</Link></Button>} />
      </Section>
    );
  return (
    <Section>
      <Link to="/account" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> All orders</Link>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Order {o.id}</h1>
        <StatusBadge status={o.status} />
      </div>
      <p className="mt-1 text-muted-foreground">Placed on {o.date}</p>
      <div className="mt-8 space-y-6">
        <OrderProgress status={o.status} />
        <OrderItemsAndSummary order={o} />
      </div>
    </Section>
  );
}
