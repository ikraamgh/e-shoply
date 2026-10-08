import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, MailCheck } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AuthCard, Field } from "@/components/shop/AuthCard";
import { validate } from "@/lib/validate";

const schema = z.object({ email: z.string().trim().email("Enter a valid email") });

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Shoply" },
      { name: "description", content: "Reset the password for your Shoply account." },
      { property: "og:title", content: "Reset password — Shoply" },
      { property: "og:description", content: "Reset your Shoply password." },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = validate(schema, { email });
    if (!r.ok) return setError(r.errors["email"]);
    setError(undefined);
    setBusy(true);
    setTimeout(() => { setBusy(false); setSent(true); }, 700);
  };

  return (
    <AuthCard title="Reset password" subtitle="We'll email you a link to reset your password." footer={<Link to="/login" className="font-semibold text-primary">Back to sign in</Link>}>
      {sent ? (
        <div className="flex flex-col items-center text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-success/15 text-success"><MailCheck /></div>
          <p className="mt-4 text-sm">If an account exists for <strong>{email}</strong>, a reset link is on its way.</p>
          <Link to="/reset-password" className="mt-4 text-sm font-semibold text-primary">Open demo reset link</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Email" name="email" type="email" value={email} onChange={setEmail} error={error} />
          <Button variant="hero" size="lg" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Send reset link</Button>
        </form>
      )}
    </AuthCard>
  );
}
