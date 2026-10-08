import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "./Logo";

export function Footer() {
  const [email, setEmail] = useState("");
  return (
    <footer className="glass mt-16 border-x-0 border-b-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <Logo small />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">Beautifully made essentials for modern living, delivered with care.</p>
        </div>
        <FooterCol title="Shop" links={[["New arrivals", "/products"], ["Best sellers", "/products"], ["Wishlist", "/wishlist"], ["My bag", "/cart"]]} />
        <FooterCol title="Account" links={[["Sign in", "/login"], ["Create account", "/register"], ["Order history", "/account"], ["Admin", "/admin"]]} />
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Newsletter</h4>
          <p className="mt-4 text-sm text-muted-foreground">Get early access to new drops.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^\S+@\S+\.\S+$/.test(email)) return void toast.error("Please enter a valid email");
              toast.success("You're on the list!");
              setEmail("");
            }}
            className="glass mt-4 flex items-center gap-2 rounded-full p-1"
          >
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent px-3 text-sm outline-none" placeholder="you@email.com" />
            <button className="bg-gradient-brand rounded-full px-4 py-2 text-xs font-semibold text-primary-foreground">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t border-card/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-muted-foreground md:flex-row">
          <span>© 2026 Shoply. All rights reserved.</span>
          <div className="flex gap-6"><span>Privacy</span><span>Terms</span><span>Instagram</span></div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      <ul className="mt-4 space-y-3 text-sm text-foreground/70">
        {links.map(([l, to]) => (
          <li key={l}><Link to={to} className="hover:text-primary">{l}</Link></li>
        ))}
      </ul>
    </div>
  );
}
