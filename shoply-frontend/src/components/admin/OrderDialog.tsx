import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shop/common";
import { OrderItemsAndSummary } from "@/components/shop/OrderDetail";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/data";
import { useStore } from "@/lib/store";

export function OrderStatusSelect({ order }: { order: Order }) {
  const { updateOrderStatus } = useStore();
  return (
    <Select
      value={order.status}
      onValueChange={(v) => {
        const s = ORDER_STATUSES.find((x) => x === v);
        if (!s) return;
        updateOrderStatus(order.id, s);
        toast.success(`${order.id} marked as ${s}`);
      }}
    >
      <SelectTrigger className="h-8 w-36 rounded-full"><SelectValue /></SelectTrigger>
      <SelectContent>{ORDER_STATUSES.map((s: OrderStatus) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
    </Select>
  );
}

export function OrderDialog({ order, onOpenChange }: { order: Order | null; onOpenChange: (o: boolean) => void }) {
  const { customers } = { customers: null };
  void customers;
  return (
    <Dialog open={!!order} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-4xl">
        {order && (
          <>
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-3 font-display text-2xl">Order {order.id} <StatusBadge status={order.status} /></DialogTitle>
            </DialogHeader>
            <div className="glass-card grid gap-4 p-5 text-sm sm:grid-cols-4">
              <div><p className="text-muted-foreground">Customer</p><p className="font-semibold">{order.customer}</p></div>
              <div><p className="text-muted-foreground">Email</p><p className="font-semibold break-all">{order.email}</p></div>
              <div><p className="text-muted-foreground">Placed</p><p className="font-semibold">{order.date}</p></div>
              <div><Label className="text-muted-foreground">Status</Label><div className="mt-1"><OrderStatusSelect order={order} /></div></div>
            </div>
            <OrderItemsAndSummary order={order} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
