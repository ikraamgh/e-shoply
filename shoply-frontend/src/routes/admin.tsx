import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, DollarSign, Eye, Package, PackageSearch, Pencil, Plus, Search, ShoppingCart, Trash2, Users, type LucideIcon } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderDialog, OrderStatusSelect } from "@/components/admin/OrderDialog";
import { ProductFormDialog } from "@/components/admin/ProductFormDialog";
import { EmptyState, PageTitle, Section, StatusBadge } from "@/components/shop/common";
import { RequireAuth } from "@/components/shop/RequireAuth";
import { categories, customers, formatPrice, getCategory, ORDER_STATUSES, salesByMonth, type Order, type Product } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — Shoply" },
      { name: "description", content: "Shoply store overview: revenue, orders, products, customers and stock." },
      { property: "og:title", content: "Admin dashboard — Shoply" },
      { property: "og:description", content: "Shoply store management dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <RequireAuth role="admin"><AdminPage /></RequireAuth>,
});

function AdminPage() {
  const { products, allOrders, deleteProduct } = useStore();
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [viewOrder, setViewOrder] = useState<string | null>(null);
  const [pq, setPq] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const revenue = allOrders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0) + salesByMonth.reduce((s, m) => s + m.sales, 0);
  const low = products.filter((p) => p.stock < 10);
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const filteredProducts = useMemo(() => products.filter((p) => p.name.toLowerCase().includes(pq.toLowerCase())), [products, pq]);
  const filteredOrders = statusFilter === "all" ? allOrders : allOrders.filter((o) => o.status === statusFilter);
  const openOrder = allOrders.find((o) => o.id === viewOrder) ?? null;

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setFormOpen(true); };

  return (
    <Section>
      <PageTitle title="Dashboard" subtitle="Manage your store — demo data stored in this browser.">
        <Button variant="hero" onClick={openCreate}><Plus /> New product</Button>
      </PageTitle>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <Stat icon={DollarSign} label="Revenue" value={formatPrice(revenue)} note="+16.2% vs last period" />
        <Stat icon={ShoppingCart} label="Total orders" value={allOrders.length.toString()} note={`${allOrders.filter((o) => o.status === "Pending").length} pending`} />
        <Stat icon={Package} label="Products" value={String(products.length)} note={`${categories.length} categories`} />
        <Stat icon={Users} label="Customers" value={String(customers.length)} note="+4.1% this month" />
        <Stat icon={AlertTriangle} label="Units in stock" value={totalStock.toLocaleString()} note={`${low.length} low stock`} warn={low.length > 0} />
      </div>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="glass h-11 flex-wrap rounded-full p-1">
          {["overview", "products", "orders", "customers"].map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-full px-4 capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Sales" className="lg:col-span-2">
              <div className="h-72">
                <ResponsiveContainer>
                  <AreaChart data={salesByMonth}>
                    <defs>
                      <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v: number) => `$${v / 1000}k`} />
                    <Tooltip formatter={(v: number) => formatPrice(v)} />
                    <Area type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={2.5} fill="url(#g)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="Orders per month">
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={salesByMonth}>
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="var(--iris)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Recent orders" className="lg:col-span-2"><OrdersTable rows={allOrders.slice(0, 5)} onView={setViewOrder} /></Panel>
            <Panel title="Low stock">
              {low.length === 0 ? <p className="text-sm text-muted-foreground">All products well stocked.</p> : (
                <ul className="space-y-3">
                  {low.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 text-sm">
                      <AlertTriangle className={cn("size-4", p.stock === 0 ? "text-destructive" : "text-warning")} />
                      <button className="flex-1 text-left hover:text-primary" onClick={() => openEdit(p)}>{p.name}</button>
                      <span className="font-semibold">{p.stock}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <Panel title="Products" action={
            <div className="glass flex items-center gap-2 rounded-full px-3"><Search className="size-4 text-muted-foreground" /><input value={pq} onChange={(e) => setPq(e.target.value)} placeholder="Search products" className="h-9 bg-transparent text-sm outline-none" /></div>
          }>
            {filteredProducts.length === 0 ? (
              <EmptyState icon={PackageSearch} title="No products" text="Nothing matches — or create your first product." action={<Button variant="hero" onClick={openCreate}><Plus /> New product</Button>} />
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Sold</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredProducts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell><div className="flex items-center gap-3"><img src={p.images[0]} alt="" className="size-10 rounded-lg object-cover" /><span className="font-medium">{p.name}</span></div></TableCell>
                      <TableCell>{getCategory(p.categoryId)?.name}</TableCell>
                      <TableCell>{formatPrice(p.price)}</TableCell>
                      <TableCell><span className={cn("font-semibold", p.stock === 0 ? "text-destructive" : p.stock < 10 && "text-warning")}>{p.stock}</span></TableCell>
                      <TableCell>{p.sold}</TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => openEdit(p)}><Pencil /></Button>
                        <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => setToDelete(p)}><Trash2 className="text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Panel title="Orders" action={
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-40 rounded-full"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All statuses</SelectItem>{ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          }>
            {filteredOrders.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No orders with this status.</p> : <OrdersTable rows={filteredOrders} onView={setViewOrder} editable />}
          </Panel>
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <Panel title="Customers">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Orders</TableHead><TableHead>Spent</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id}><TableCell className="font-medium">{c.name}</TableCell><TableCell>{c.email}</TableCell><TableCell>{c.orders}</TableCell><TableCell>{formatPrice(c.spent)}</TableCell><TableCell>{c.joined}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>
      </Tabs>

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />
      <OrderDialog order={openOrder} onOpenChange={(o) => !o && setViewOrder(null)} />
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This removes the product from the store. Existing orders keep their records.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (toDelete) { deleteProduct(toDelete.id); toast.success(`${toDelete.name} deleted`); } setToDelete(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  );
}

function Stat({ icon: Icon, label, value, note, warn }: { icon: LucideIcon; label: string; value: string; note: string; warn?: boolean }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="bg-gradient-brand grid size-9 place-items-center rounded-xl text-primary-foreground"><Icon className="size-4" /></span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      <p className={cn("mt-1 text-xs font-medium", warn ? "text-warning" : "text-success")}>{note}</p>
    </div>
  );
}

function Panel({ title, children, className, action }: { title: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <div className={cn("glass-card overflow-x-auto p-6", className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">{title}</h2>{action}</div>
      {children}
    </div>
  );
}

function OrdersTable({ rows, onView, editable }: { rows: Order[]; onView: (id: string) => void; editable?: boolean }) {
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead><TableHead /></TableRow></TableHeader>
      <TableBody>
        {rows.map((o) => (
          <TableRow key={o.id}>
            <TableCell className="font-medium">{o.id}</TableCell>
            <TableCell><div>{o.customer}</div><div className="text-xs text-muted-foreground">{o.email}</div></TableCell>
            <TableCell>{o.date}</TableCell>
            <TableCell>{editable ? <OrderStatusSelect order={o} /> : <StatusBadge status={o.status} />}</TableCell>
            <TableCell className="text-right font-semibold">{formatPrice(o.total)}</TableCell>
            <TableCell className="text-right"><Button size="icon" variant="ghost" aria-label="View order" onClick={() => onView(o.id)}><Eye /></Button></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
