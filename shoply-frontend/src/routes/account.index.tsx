import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, MapPin, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field } from "@/components/shop/AuthCard";
import { EmptyState, PageTitle, Section, StatusBadge } from "@/components/shop/common";
import { RequireAuth } from "@/components/shop/RequireAuth";
import { formatPrice } from "@/lib/data";
import { useStore } from "@/lib/store";
import { validate, type FieldErrors } from "@/lib/validate";

export const Route = createFileRoute("/account/")({
  head: () => ({
    meta: [
      { title: "My account — Shoply" },
      { name: "description", content: "Manage your Shoply profile and view your order history." },
      { property: "og:title", content: "My account — Shoply" },
      { property: "og:description", content: "Your Shoply profile and orders." },
    ],
  }),
  component: () => <RequireAuth><AccountPage /></RequireAuth>,
});

const schema = z.object({
  name: z.string().trim().min(2, "Required").max(80),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().regex(/^[+\d\s()-]{0,20}$/, "Invalid phone"),
});

function AccountPage() {
  const { user, wishlist, myOrders, updateUser, logout } = useStore();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<FieldErrors<keyof typeof f>>({});
  useEffect(() => { if (user) setF({ name: user.name, email: user.email, phone: user.phone ?? "" }); }, [user]);
  if (!user) return null;

  return (
    <Section>
      <PageTitle title={`Hi, ${user.name.split(" ")[0]}`} subtitle="Manage your profile and orders.">
        <Button variant="glass" onClick={() => { logout(); navigate({ to: "/", replace: true }); }}><LogOut /> Sign out</Button>
      </PageTitle>
      <Tabs defaultValue="orders" className="mt-8">
        <TabsList className="glass h-auto flex-wrap rounded-full p-1">
          <TabsTrigger value="orders" className="rounded-full px-5">Orders</TabsTrigger>
          <TabsTrigger value="profile" className="rounded-full px-5">Profile</TabsTrigger>
          <TabsTrigger value="wishlist" className="rounded-full px-5">Wishlist</TabsTrigger>
          <TabsTrigger value="addresses" className="rounded-full px-5">Addresses</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-full px-5">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="mt-6">
          {myOrders.length === 0 ? (
            <EmptyState icon={Package} title="No orders yet" text="When you place an order it will show up here." action={<Button asChild variant="hero"><Link to="/products">Start shopping</Link></Button>} />
          ) : (
            <div className="space-y-4">
              {myOrders.map((o) => (
                <Link key={o.id} to="/account/orders/$id" params={{ id: o.id }} className="glass-card flex flex-wrap items-center gap-4 p-5 transition hover:shadow-glow">
                  <div className="flex -space-x-3">
                    {o.items.slice(0, 3).map((i) => <img key={i.productId} src={i.image} alt="" className="size-12 rounded-xl border-2 border-card object-cover" />)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{o.id}</p>
                    <p className="text-sm text-muted-foreground">{o.date} · {o.items.reduce((s, i) => s + i.quantity, 0)} items</p>
                  </div>
                  <StatusBadge status={o.status} />
                  <span className="w-20 text-right font-display font-bold">{formatPrice(o.total)}</span>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="profile" className="mt-6">
          <form
            noValidate
            className="glass-card max-w-xl space-y-4 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              const r = validate(schema, f);
              if (!r.ok) return setErrors(r.errors);
              setErrors({});
              updateUser({ ...user, name: r.data.name, email: r.data.email, phone: r.data.phone || undefined });
              toast.success("Profile updated");
            }}
          >
            <Field label="Full name" name="name" value={f.name} onChange={(v) => setF({ ...f, name: v })} error={errors.name} />
            <Field label="Email" name="email" type="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} error={errors.email} />
            <Field label="Phone" name="phone" value={f.phone} onChange={(v) => setF({ ...f, phone: v })} error={errors.phone} />
            <Button variant="hero">Save changes</Button>
          </form>
        </TabsContent>
        <TabsContent value="wishlist" className="mt-6">
          <div className="glass-card flex flex-wrap items-center justify-between gap-4 p-6">
            <p>You have <strong>{wishlist.length}</strong> saved item{wishlist.length === 1 ? "" : "s"}.</p>
            <Button asChild variant="hero"><Link to="/wishlist">Open wishlist</Link></Button>
          </div>
        </TabsContent>
        <TabsContent value="addresses" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 font-semibold"><MapPin className="size-4 text-primary" /> Default shipping</div>
              <p className="mt-3 text-sm text-muted-foreground">{user.name}<br />24 Harbor Lane<br />Portland, OR 97201<br />United States</p>
            </div>
            <button onClick={() => toast("Address book will connect to your account soon")} className="glass-card grid place-items-center p-6 text-sm font-semibold text-primary transition hover:shadow-glow">+ Add new address</button>
          </div>
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <div className="glass-card max-w-xl divide-y p-2">
            {[["Order updates by email", true], ["Product news & offers", false]].map(([label, on]) => (
              <label key={String(label)} className="flex items-center justify-between p-4 text-sm">
                {label}<Switch defaultChecked={Boolean(on)} onCheckedChange={() => toast.success("Preference saved")} />
              </label>
            ))}
            <div className="flex items-center justify-between p-4 text-sm">
              Password<Button asChild variant="glass" size="sm"><Link to="/reset-password">Change</Link></Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Section>
  );
}
