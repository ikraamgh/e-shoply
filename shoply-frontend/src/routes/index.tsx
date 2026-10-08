import { createFileRoute, Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/ProductCard";
import { Section } from "@/components/shop/common";
import { categories, formatPrice, heroImage } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shoply — Everyday essentials, beautifully made" },
      { name: "description", content: "Curated objects for modern living — thoughtfully designed, sustainably sourced, delivered to your door." },
      { property: "og:title", content: "Shoply — Everyday essentials, beautifully made" },
      { property: "og:description", content: "Curated objects for modern living, delivered to your door." },
    ],
  }),
  component: Home,
});

function Home() {
  const { products } = useStore();
  const featured = products.filter((p) => p.featured);
  const best = [...products].sort((a, b) => b.sold - a.sold).slice(0, 3);
  return (
    <>
      <Section className="pb-8 pt-14">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="max-w-xl">
            <span className="glass inline-flex rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-primary">New season drop</span>
            <h1 className="mt-6 text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl">
              Everyday essentials, <span className="text-gradient">beautifully</span> made.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">Curated objects for modern living — thoughtfully designed, sustainably sourced, delivered to your door.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild variant="hero" size="lg"><Link to="/products">Shop the collection</Link></Button>
              <Button asChild variant="glass" size="lg"><a href="#categories">Browse categories</a></Button>
            </div>
          </div>
          <div className="relative">
            <div className="glass absolute -inset-4 rounded-[2.2rem]" />
            <img src={heroImage} alt="Ceramic vase with eucalyptus" width={1024} height={1024} className="relative aspect-square w-full rounded-[1.8rem] object-cover" />
          </div>
        </div>
      </Section>

      <Section>
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Featured products</h2>
          <Link to="/products" className="text-sm font-semibold text-primary">View all →</Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </Section>

      <Section>
        <h2 id="categories" className="scroll-mt-24 text-3xl font-bold tracking-tight">Shop by category</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.id} to="/products" search={{ category: c.id }} className="glass-card group p-6 transition hover:shadow-glow">
              <div className="mb-4 h-40 overflow-hidden rounded-2xl">
                <img src={c.image} alt={c.name} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <h3 className="font-sans font-semibold">{c.name}</h3>
              <p className="text-sm text-muted-foreground">{c.count} items</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section>
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Best sellers</h2>
          <Link to="/products" search={{ sort: "popular" }} className="text-sm font-semibold text-primary">See more →</Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {best.map((p, i) => (
            <Link key={p.id} to="/products/$id" params={{ id: p.id }} className="glass-card flex gap-5 p-5 transition hover:shadow-glow">
              <img src={p.images[0]} alt={p.name} loading="lazy" className="size-28 shrink-0 rounded-2xl object-cover" />
              <div className="flex flex-col justify-center">
                <span className="flex items-center gap-1 text-xs font-semibold text-iris"><Star className="size-3 fill-iris" /> #{i + 1} this week</span>
                <h3 className="mt-1 font-sans font-semibold">{p.name}</h3>
                <p className="mt-2 font-display font-bold">{formatPrice(p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="py-12">
        <div className="bg-gradient-promo relative overflow-hidden rounded-[2rem] p-10 shadow-glow md:p-14">
          <div className="absolute -right-10 -top-10 size-64 rounded-full bg-card/20 blur-3xl" />
          <div className="relative max-w-lg text-primary-foreground">
            <span className="inline-block rounded-full bg-card/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.15em]">Limited time</span>
            <h2 className="mt-4 text-4xl font-bold leading-tight">Up to 40% off the autumn edit.</h2>
            <p className="mt-3 opacity-85">Fresh ceramics, linen and light for the season. Ends Sunday at midnight.</p>
            <Button asChild variant="light" size="lg" className="mt-6"><Link to="/products">Shop the sale</Link></Button>
          </div>
        </div>
      </Section>
    </>
  );
}
