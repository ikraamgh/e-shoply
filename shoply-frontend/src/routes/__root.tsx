import { Outlet, Link, createRootRoute, type ErrorComponentProps } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { StoreProvider } from "@/lib/store";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="glass-card max-w-md p-10 text-center">
        <h1 className="text-gradient text-7xl font-bold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <Button asChild variant="hero" className="mt-6"><Link to="/">Go home</Link></Button>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card max-w-md p-10 text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. You can try refreshing or head back home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="hero" onClick={() => { router.invalidate(); reset(); }}>Try again</Button>
          <Button variant="glass" asChild><a href="/">Go home</a></Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Shoply — Everyday essentials, beautifully made" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  return (
    <StoreProvider>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-32 size-[520px] rounded-full bg-primary/30 blur-[130px]" />
        <div className="absolute right-[-120px] top-40 size-[560px] rounded-full bg-iris/25 blur-[140px]" />
        <div className="absolute bottom-[-160px] left-1/3 size-[520px] rounded-full bg-aqua/25 blur-[150px]" />
      </div>
      <div className="flex min-h-screen flex-col overflow-x-hidden">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <Toaster position="bottom-right" richColors />
    </StoreProvider>
  );
}
