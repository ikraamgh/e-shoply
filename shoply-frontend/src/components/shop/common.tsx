import { Minus, Plus, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("mx-auto max-w-7xl px-4 py-10 sm:px-6", className)}>{children}</section>;
}

export function PageTitle({ title, subtitle, children }: { title: string; subtitle?: string | undefined; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="glass-card mx-auto flex max-w-md flex-col items-center px-8 py-14 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-6" />
      </div>
      <h2 className="mt-5 text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function QuantitySelector({ value, onChange, max = 99 }: { value: number; onChange: (n: number) => void; max?: number }) {
  return (
    <div className="glass inline-flex items-center rounded-full">
      <button aria-label="Decrease" className="grid size-9 place-items-center disabled:opacity-40" disabled={value <= 1} onClick={() => onChange(value - 1)}>
        <Minus className="size-4" />
      </button>
      <span className="w-8 text-center text-sm font-semibold">{value}</span>
      <button aria-label="Increase" className="grid size-9 place-items-center disabled:opacity-40" disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus className="size-4" />
      </button>
    </div>
  );
}

const statusStyles: Record<OrderStatus, string> = {
  Pending: "bg-warning/15 text-warning",
  Confirmed: "bg-success/15 text-success",
  Processing: "bg-primary/10 text-primary",
  Shipped: "bg-aqua/15 text-aqua",
  Delivered: "bg-success/15 text-success",
  Cancelled: "bg-destructive/10 text-destructive",
};
export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant="outline" className={cn("rounded-full border-0 font-semibold", statusStyles[status])}>{status}</Badge>;
}

export function FieldError({ msg }: { msg?: string | undefined }) {
  return msg ? <p className="mt-1 text-xs text-destructive">{msg}</p> : null;
}
