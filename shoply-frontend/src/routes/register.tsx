import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AuthCard, Field } from "@/components/shop/AuthCard";
import { useStore } from "@/lib/store";
import { validate, type FieldErrors } from "@/lib/validate";

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(80),
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters").regex(/\d/, "Include at least one number"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — Shoply" },
      { name: "description", content: "Create a Shoply account for faster checkout and order tracking." },
      { property: "og:title", content: "Create account — Shoply" },
      { property: "og:description", content: "Join Shoply today." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { login, apiMode, apiRegister } = useStore();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<FieldErrors<keyof typeof f>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = validate(schema, f);
    if (!r.ok) return setErrors(r.errors);
    setErrors({});
    setBusy(true);
    try {
      if (apiMode) {
        await apiRegister(r.data.name, r.data.email, r.data.password);
        navigate({ to: "/account" });
      } else {
        await new Promise((res) => setTimeout(res, 700));
        login({ name: r.data.name, email: r.data.email, role: "customer" });
        toast.success("Account created — welcome to Shoply! (demo mode)");
        navigate({ to: "/account" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Create account" subtitle="Faster checkout, order tracking and a saved wishlist." footer={<>Already have an account? <Link to="/login" className="font-semibold text-primary">Sign in</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Full name" name="name" value={f.name} onChange={set("name")} error={errors.name} />
        <Field label="Email" name="email" type="email" value={f.email} onChange={set("email")} error={errors.email} />
        <Field label="Password" name="password" type="password" value={f.password} onChange={set("password")} error={errors.password} />
        <Field label="Confirm password" name="confirm" type="password" value={f.confirm} onChange={set("confirm")} error={errors.confirm} />
        <Button variant="hero" size="lg" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Create account</Button>
      </form>
    </AuthCard>
  );
}
