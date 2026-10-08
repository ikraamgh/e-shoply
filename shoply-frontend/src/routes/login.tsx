import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AuthCard, Field } from "@/components/shop/AuthCard";
import { useStore } from "@/lib/store";
import { validate, type FieldErrors } from "@/lib/validate";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Sign in — Shoply" },
      { name: "description", content: "Sign in to your Shoply account to track orders and manage your wishlist." },
      { property: "og:title", content: "Sign in — Shoply" },
      { property: "og:description", content: "Sign in to your Shoply account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, apiMode, apiLogin } = useStore();
  const router = useRouter();
  const { redirect } = Route.useSearch();
  const [f, setF] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<keyof typeof f>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = validate(schema, f);
    if (!r.ok) return setErrors(r.errors);
    setErrors({});
    setBusy(true);
    try {
      if (apiMode) {
        await apiLogin(r.data.email, r.data.password);
        const isAdmin = r.data.email.toLowerCase().startsWith("admin@");
        router.history.push(redirect && redirect.startsWith("/") ? redirect : isAdmin ? "/admin" : "/account");
      } else {
        // Demo fallback (no backend)
        await new Promise((res) => setTimeout(res, 700));
        const isAdmin = r.data.email.toLowerCase().startsWith("admin@");
        login({ name: isAdmin ? "Store Admin" : "Alex Rivera", email: r.data.email, role: isAdmin ? "admin" : "customer" });
        toast.success("Welcome back! (demo mode)");
        router.history.push(redirect && redirect.startsWith("/") ? redirect : isAdmin ? "/admin" : "/account");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your Shoply account." footer={<>New here? <Link to="/register" className="font-semibold text-primary">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email" name="email" type="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} error={errors.email} placeholder="you@email.com" />
        <Field label="Password" name="password" type="password" value={f.password} onChange={(v) => setF({ ...f, password: v })} error={errors.password} />
        <div className="text-right"><Link to="/forgot-password" className="text-sm font-medium text-primary">Forgot password?</Link></div>
        <Button variant="hero" size="lg" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Sign in</Button>
      </form>
      <p className="mt-5 rounded-2xl bg-primary/5 p-3 text-xs text-muted-foreground">
        Demo: any password (6+ chars). Use <strong>alex@shoply.dev</strong> for a customer with orders, or <strong>admin@shoply.dev</strong> for the admin dashboard.
      </p>
    </AuthCard>
  );
}
