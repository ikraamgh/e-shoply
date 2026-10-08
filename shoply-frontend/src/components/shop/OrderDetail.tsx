import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { formatPrice, type Order, type OrderStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

const steps: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered"];

export function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === "Cancelled") return <div className="glass-card p-6 text-sm font-medium text-destructive">This order was cancelled.</div>;
  const current = steps.indexOf(status);
  return (
    <div className="glass-card p-6">
      <ol className="grid grid-cols-4 gap-2">
        {steps.map((s, i) => (
          <li key={s} className="flex flex-col items-center gap-2 text-center text-xs font-medium sm:text-sm">
            <span className={cn("grid size-9 place-items-center rounded-full", i <= current ? "bg-gradient-brand text-primary-foreground" : "bg-muted text-muted-foreground")}>
              {i <= current ? <Check className="size-4" /> : i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function OrderItemsAndSummary({ order: o }: { order: Order }) {
  const sub = o.items.reduce((s, i) => s + i.price * i.quantity, 0);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <ul className="glass-card divide-y p-2">
        {o.items.map((i) => (
          <li key={i.productId} className="flex items-center gap-4 p-4">
            <img src={i.image} alt="" className="size-16 rounded-xl object-cover" />
            <div className="flex-1">
              <Link to="/products/$id" params={{ id: i.productId }} className="font-semibold hover:text-primary">{i.name}</Link>
              <p className="text-sm text-muted-foreground">{formatPrice(i.price)} × {i.quantity}</p>
            </div>
            <span className="font-semibold">{formatPrice(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="glass-card h-fit space-y-3 p-6 text-sm">
        <h2 className="text-lg font-bold">Summary</h2>
        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(sub)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{o.shipping ? formatPrice(o.shipping) : "Free"}</span></div>
        <div className="flex justify-between border-t pt-3 text-base font-bold"><span>Total</span><span className="font-display">{formatPrice(o.total)}</span></div>
        <div className="border-t pt-3">
          <p className="font-semibold">Ship to</p>
          <p className="text-muted-foreground">{o.customer} · {o.email}<br />{o.address}</p>
        </div>
      </div>
    </div>
  );
}
