import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore, type Role } from "@/lib/store";
import { EmptyState, Section } from "./common";

/** Client-side guard for account/admin pages. Replace with token check once the API exists. */
export function RequireAuth({ children, role }: { children: ReactNode; role?: Role }) {
  const { user, hydrated } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/login", search: { redirect: location.pathname }, replace: true });
  }, [hydrated, user]);

  if (!hydrated || !user)
    return (
      <Section>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-8 h-64 w-full rounded-3xl" />
      </Section>
    );
  if (role && user.role !== role)
    return (
      <Section className="py-20">
        <EmptyState icon={ShieldAlert} title="Admin access required" text="Sign in with an admin account (e.g. admin@shoply.dev) to manage the store." action={<Button asChild variant="hero"><Link to="/">Back to store</Link></Button>} />
      </Section>
    );
  return <>{children}</>;
}
