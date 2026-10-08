import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, type Product } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const saved = inWishlist(product.id);
  return (
    <article className="glass-card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-glow">
      <div className="relative">
        <Link to="/products/$id" params={{ id: product.id }} className="block aspect-square overflow-hidden">
          <img src={product.images[0]} alt={product.name} loading="lazy" width={600} height={600} className="size-full object-cover transition duration-500 group-hover:scale-105" />
        </Link>
        <button
          onClick={() => toggleWishlist(product)}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          className="glass absolute right-3 top-3 grid size-9 place-items-center rounded-full"
        >
          <Heart className={cn("size-4", saved && "fill-primary text-primary")} />
        </button>
        {product.compareAt && <span className="bg-gradient-brand absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold text-primary-foreground">Sale</span>}
        {product.stock === 0 && <span className="glass absolute bottom-3 left-3 rounded-full px-3 py-1 text-[11px] font-semibold">Sold out</span>}
      </div>
      <div className="p-5">
        <Link to="/products/$id" params={{ id: product.id }}>
          <h3 className="font-sans font-semibold hover:text-primary">{product.name}</h3>
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">{product.tagline}</p>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-warning text-warning" /> {product.rating} <span>({product.reviews})</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display font-bold">
            {formatPrice(product.price)}
            {product.compareAt && <span className="ml-2 text-xs font-normal text-muted-foreground line-through">{formatPrice(product.compareAt)}</span>}
          </span>
          <Button size="sm" variant="soft" disabled={product.stock === 0} onClick={() => addToCart(product)}>Add to bag</Button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}
