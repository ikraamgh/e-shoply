import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { Logo } from "./Logo";

const nav = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
  { to: "/wishlist", label: "Wishlist" },
  { to: "/admin", label: "Admin" },
] as const;

export function Header() {
  const { cartCount, wishlist, user } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/products", search: { q: q || undefined } });
  };

  return (
    <header className="glass sticky top-0 z-50 border-x-0 border-t-0">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger className="grid size-10 place-items-center rounded-full md:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="mt-6 flex flex-col gap-1">
                {nav.map((n) => (
                  <Link key={n.to} to={n.to} className="rounded-xl px-3 py-2.5 font-medium hover:bg-accent">
                    {n.label}
                  </Link>
                ))}
                <Link to={user ? "/account" : "/login"} className="rounded-xl px-3 py-2.5 font-medium hover:bg-accent">
                  {user ? "My account" : "Sign in"}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/"><Logo /></Link>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-foreground/70 md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="hover:text-primary" activeProps={{ className: "text-primary" }} activeOptions={{ exact: n.to === "/" }}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <form onSubmit={submit} className="glass hidden items-center gap-2 rounded-full px-4 py-2 lg:flex">
            <Search className="size-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="w-40 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </form>
          <Link to="/wishlist" className="glass relative hidden size-10 place-items-center rounded-full sm:grid" aria-label="Wishlist">
            <Heart className="size-4" />
            {wishlist.length > 0 && <Badge n={wishlist.length} />}
          </Link>
          <Link to={user ? "/account" : "/login"} className="glass hidden size-10 place-items-center rounded-full sm:grid" aria-label="Account">
            <User className="size-4" />
          </Link>
          <Link to="/cart" className="glass relative grid size-10 place-items-center rounded-full" aria-label="Cart">
            <ShoppingBag className="size-4" />
            {cartCount > 0 && <Badge n={cartCount} />}
          </Link>
        </div>
      </div>
    </header>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
      {n}
    </span>
  );
}
