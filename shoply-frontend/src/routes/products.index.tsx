import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PackageSearch, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard, ProductCardSkeleton } from "@/components/shop/ProductCard";
import { EmptyState, PageTitle, Section } from "@/components/shop/common";
import { categories, formatPrice } from "@/lib/data";
import { useStore } from "@/lib/store";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(["featured", "price-asc", "price-desc", "rating", "popular"]).optional(),
  page: z.number().int().min(1).optional(),
});

export const Route = createFileRoute("/products/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop all products — Shoply" },
      { name: "description", content: "Browse, search and filter Shoply's full catalogue of home, travel, workspace and wellness goods." },
      { property: "og:title", content: "Shop all products — Shoply" },
      { property: "og:description", content: "Browse and filter the full Shoply catalogue." },
    ],
  }),
  component: ProductsPage,
});

const PER_PAGE = 8;
const MAX = 200;

function ProductsPage() {
  const s = Route.useSearch();
  const { products } = useStore();
  const navigate = useNavigate({ from: "/products/" });
  const [q, setQ] = useState(s.q ?? "");
  const [price, setPrice] = useState<[number, number]>([0, MAX]);
  const [loading, setLoading] = useState(true);
  const selected = s.category ? s.category.split(",") : [];
  const sort = s.sort ?? "featured";
  const page = s.page ?? 1;

  useEffect(() => setQ(s.q ?? ""), [s.q]);
  // Simulated network latency so loading states are visible.
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, [s.q, s.category, s.sort, s.page, price[0], price[1]]);

  const filtered = useMemo(() => {
    let r = products.filter(
      (p) =>
        (!s.q || (p.name + p.tagline).toLowerCase().includes(s.q.toLowerCase())) &&
        (selected.length === 0 || selected.includes(p.categoryId)) &&
        p.price >= price[0] && p.price <= price[1],
    );
    r = [...r].sort((a, b) =>
      sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : sort === "rating" ? b.rating - a.rating : sort === "popular" ? b.sold - a.sold : Number(!!b.featured) - Number(!!a.featured),
    );
    return r;
  }, [products, s.q, s.category, sort, price]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleCat = (id: string) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    navigate({ search: (p) => ({ ...p, category: next.length ? next.join(",") : undefined, page: undefined }) });
  };
  const reset = () => {
    setPrice([0, MAX]);
    navigate({ search: {} });
  };

  return (
    <Section>
      <PageTitle title="Shop all" subtitle={`${filtered.length} products`}>
        <div className="flex w-full flex-wrap gap-3 sm:w-auto">
          <form
            onSubmit={(e) => { e.preventDefault(); navigate({ search: (p) => ({ ...p, q: q || undefined, page: undefined }) }); }}
            className="glass flex flex-1 items-center gap-2 rounded-full px-4 sm:w-72"
          >
            <Search className="size-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="h-10 w-full bg-transparent text-sm outline-none" />
          </form>
          <Select value={sort} onValueChange={(v) => navigate({ search: (p) => ({ ...p, sort: v as typeof sort, page: undefined }) })}>
            <SelectTrigger className="glass h-10 w-44 rounded-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="popular">Best selling</SelectItem>
              <SelectItem value="rating">Top rated</SelectItem>
              <SelectItem value="price-asc">Price: low to high</SelectItem>
              <SelectItem value="price-desc">Price: high to low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageTitle>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="glass-card h-fit space-y-8 p-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Category</h3>
            <div className="mt-4 space-y-3">
              {categories.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-3 text-sm">
                  <Checkbox checked={selected.includes(c.id)} onCheckedChange={() => toggleCat(c.id)} />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Price</h3>
            <Slider className="mt-5" min={0} max={MAX} step={5} value={price} onValueChange={(v) => setPrice([v[0] ?? 0, v[1] ?? MAX])} />
            <div className="mt-3 flex justify-between text-sm text-muted-foreground"><span>{formatPrice(price[0])}</span><span>{formatPrice(price[1])}</span></div>
          </div>
          <Button variant="outline" className="w-full" onClick={reset}>Clear filters</Button>
        </aside>

        <div>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
          ) : visible.length === 0 ? (
            <EmptyState icon={PackageSearch} title="No products found" text="Try a different search or loosen your filters." action={<Button variant="hero" onClick={reset}>Reset filters</Button>} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">{visible.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          )}

          {pages > 1 && !loading && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Button variant="glass" size="sm" disabled={page === 1} onClick={() => navigate({ search: (p) => ({ ...p, page: page - 1 }) })}>Previous</Button>
              {Array.from({ length: pages }).map((_, i) => (
                <Button key={i} size="icon" variant={page === i + 1 ? "hero" : "glass"} className="size-8" onClick={() => navigate({ search: (p) => ({ ...p, page: i + 1 }) })}>{i + 1}</Button>
              ))}
              <Button variant="glass" size="sm" disabled={page === pages} onClick={() => navigate({ search: (p) => ({ ...p, page: page + 1 }) })}>Next</Button>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
