import type { ReactNode } from "react";
import { formatPrice, SHIPPING_FREE_THRESHOLD, shippingFor } from "@/lib/data";
import { useStore } from "@/lib/store";

export function OrderSummary({ children, showItems }: { children?: ReactNode; showItems?: boolean }) {
  const { subtotal, cartLines } = useStore();
  const shipping = shippingFor(subtotal);
  return (
    <div className="glass-card h-fit p-6">
      <h2 className="text-lg font-bold">Order summary</h2>
      {showItems && (
        <ul className="mt-4 space-y-3 border-b pb-4">
          {cartLines.map(({ product, quantity }) => (
            <li key={product.id} className="flex items-center gap-3 text-sm">
              <img src={product.images[0]} alt="" className="size-12 rounded-xl object-cover" />
              <span className="flex-1">{product.name} <span className="text-muted-foreground">× {quantity}</span></span>
              <span className="font-semibold">{formatPrice(product.price * quantity)}</span>
            </li>
          ))}
        </ul>
      )}
      <dl className="mt-4 space-y-3 text-sm">
        <Row label="Subtotal" value={formatPrice(subtotal)} />
        <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
        {subtotal > 0 && subtotal < SHIPPING_FREE_THRESHOLD && (
          <p className="text-xs text-primary">Add {formatPrice(SHIPPING_FREE_THRESHOLD - subtotal)} more for free shipping.</p>
        )}
        <div className="border-t pt-3"><Row label="Total" value={formatPrice(subtotal + shipping)} strong /></div>
      </dl>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "text-base font-bold" : ""}`}>
      <dt className={strong ? "" : "text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "font-display" : "font-medium"}>{value}</dd>
    </div>
  );
}
