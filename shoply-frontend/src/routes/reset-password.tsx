import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AuthCard, Field } from "@/components/shop/AuthCard";
import { validate, type FieldErrors } from "@/lib/validate";

const schema = z
  .object({ password: z.string().min(8, "At least 8 characters").max(72), confirm: z.string() })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — Shoply" },
      { name: "description", content: "Set a new password for your Shoply account." },
      { property: "og:title", content: "Choose a new password — Shoply" },
      { property: "og:description", content: "Set a new Shoply password." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [f, setF] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = validate(schema, f);
    if (!r.ok) return setErrors(r.errors);
    setErrors({});
    setBusy(true);
    // Mock: will POST /api/reset-password (Laravel) with token + password.
    setTimeout(() => { toast.success("Password updated — please sign in"); navigate({ to: "/login" }); }, 700);
  };
  return (
    <AuthCard title="New password" subtitle="Choose a strong password you haven't used before." footer={<Link to="/login" className="font-semibold text-primary">Back to sign in</Link>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="New password" name="password" type="password" value={f.password} onChange={(v) => setF({ ...f, password: v })} error={errors["password"]} />
        <Field label="Confirm password" name="confirm" type="password" value={f.confirm} onChange={(v) => setF({ ...f, confirm: v })} error={errors["confirm"]} />
        <Button variant="hero" size="lg" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Update password</Button>
      </form>
    </AuthCard>
  );
}
