export function Logo({ small }: { small?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`bg-gradient-brand grid place-items-center font-display font-bold text-primary-foreground ${small ? "size-8 rounded-lg" : "size-9 rounded-xl"}`}>S</span>
      <span className={`font-display font-bold tracking-tight ${small ? "text-lg" : "text-xl"}`}>Shoply</span>
    </span>
  );
}
