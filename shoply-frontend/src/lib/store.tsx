import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { products as seedProducts, orders as seedOrders, type Order, type OrderStatus, type Product } from "./data";
import {
  authApi, cartApi, wishlistApi, ordersApi, productsApi,
  setToken, getToken, type ApiUser,
} from "./api";

// ── Types ──────────────────────────────────────────────────────────────────
export type CartLine = { productId: string; quantity: number };
export type Role = "customer" | "admin";
export type User = { name: string; email: string; phone?: string | undefined; role: Role };

type Store = {
  hydrated: boolean;
  apiMode: boolean;
  products: Product[];
  getProduct: (id: string) => Product | undefined;
  cart: CartLine[];
  wishlist: string[];
  user: User | null;
  allOrders: Order[];
  myOrders: Order[];
  addToCart: (p: Product, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleWishlist: (p: Product) => void;
  moveToCart: (p: Product) => void;
  inWishlist: (id: string) => boolean;
  login: (u: User) => void;
  logout: () => void;
  updateUser: (u: User) => void;
  placeOrder: (o: Order) => void;
  saveProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  // API helpers
  apiLogin: (email: string, password: string) => Promise<void>;
  apiRegister: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  apiLogout: () => Promise<void>;
  loadProducts: () => Promise<void>;
  loadOrders: () => Promise<void>;
  cartCount: number;
  cartLines: { product: Product; quantity: number }[];
  subtotal: number;
};

const Ctx = createContext<Store | null>(null);

function usePersisted<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setV(JSON.parse(raw) as T);
    } catch { /* ignore corrupt storage */ }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (ready) localStorage.setItem(key, JSON.stringify(v));
  }, [key, v, ready]);
  return [v, setV, ready] as const;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts, r1] = usePersisted<Product[]>("shoply.products.v1", seedProducts);
  const [cart, setCart, r2] = usePersisted<CartLine[]>("shoply.cart", []);
  const [wishlist, setWishlist] = usePersisted<string[]>("shoply.wishlist", []);
  const [user, setUser, r3] = usePersisted<User | null>("shoply.user.v2", null);
  const [allOrders, setAllOrders, r4] = usePersisted<Order[]>("shoply.orders.v2", seedOrders);
  const [apiMode, setApiMode] = useState(false);

  // ── Detect if backend is reachable ────────────────────────────────────
  useEffect(() => {
    fetch("http://localhost:8000/api/v1/categories", { headers: { Accept: "application/json" } })
      .then(() => setApiMode(true))
      .catch(() => setApiMode(false));
  }, []);

  // ── When API mode activates, load products from backend ───────────────
  useEffect(() => {
    if (!apiMode) return;
    productsApi.list().then((ps) => {
      setProducts(ps as unknown as Product[]);
    }).catch(() => {/* keep local data */});
  }, [apiMode]);

  // ── When user logs in via API, sync cart & wishlist ───────────────────
  useEffect(() => {
    if (!apiMode || !user) return;
    cartApi.get().then((lines) => setCart(lines)).catch(() => {});
    wishlistApi.get().then((ids) => setWishlist(ids)).catch(() => {});
    ordersApi.list().then((orders) => {
      setAllOrders(orders as unknown as Order[]);
    }).catch(() => {});
  }, [apiMode, user?.email]);

  const getProduct = (id: string) => products.find((p) => p.id === id);

  const cartLines = cart.flatMap((l) => {
    const product = getProduct(l.productId);
    return product ? [{ product, quantity: l.quantity }] : [];
  });
  const subtotal = cartLines.reduce((s, l) => s + l.product.price * l.quantity, 0);

  const addToCart = (p: Product, qty = 1, silent = false) => {
    if (p.stock === 0) return void toast.error(`${p.name} is out of stock`);
    if (apiMode && user) {
      cartApi.add(p.id, qty)
        .then((lines) => setCart(lines))
        .catch(() => toast.error("Failed to update cart"));
    } else {
      setCart((c) => {
        const ex = c.find((l) => l.productId === p.id);
        if (ex) return c.map((l) => (l.productId === p.id ? { ...l, quantity: Math.min(p.stock, l.quantity + qty) } : l));
        return [...c, { productId: p.id, quantity: Math.min(qty, p.stock) }];
      });
    }
    if (!silent) toast.success(`Added ${p.name} to your bag`);
  };

  // ── API auth helpers ──────────────────────────────────────────────────
  const apiLogin = async (email: string, password: string) => {
    const { user: u, token } = await authApi.login(email, password);
    setToken(token);
    setUser({ name: u.name, email: u.email, phone: u.phone, role: u.role });
    toast.success("Welcome back!");
  };

  const apiRegister = async (name: string, email: string, password: string, phone?: string) => {
    const { user: u, token } = await authApi.register({
      name, email, password,
      password_confirmation: password,
      ...(phone ? { phone } : {}),
    });
    setToken(token);
    setUser({ name: u.name, email: u.email, phone: u.phone, role: u.role });
    toast.success("Account created!");
  };

  const apiLogout = async () => {
    if (getToken()) await authApi.logout().catch(() => {});
    setToken(null);
    setUser(null);
    setCart([]);
    setWishlist([]);
    toast("Signed out");
  };

  const loadProducts = async () => {
    try {
      const ps = await productsApi.list();
      setProducts(ps as unknown as Product[]);
    } catch { toast.error("Could not load products from API"); }
  };

  const loadOrders = async () => {
    try {
      const orders = await ordersApi.list();
      setAllOrders(orders as unknown as Order[]);
    } catch { toast.error("Could not load orders from API"); }
  };

  const store: Store = {
    hydrated: r1 && r2 && r3 && r4,
    apiMode,
    products,
    getProduct,
    cart,
    wishlist,
    user,
    allOrders,
    myOrders: user ? allOrders.filter((o) => o.email.toLowerCase() === user.email.toLowerCase()) : [],
    cartLines,
    subtotal,
    cartCount: cart.reduce((s, l) => s + l.quantity, 0),

    addToCart: (p, qty) => addToCart(p, qty),

    setQty: (id, qty) => {
      if (apiMode && user) {
        cartApi.update(id, qty).then(setCart).catch(() => {});
      } else {
        setCart((c) => c.map((l) => (l.productId === id ? { ...l, quantity: Math.max(1, qty) } : l)));
      }
    },

    removeFromCart: (id) => {
      if (apiMode && user) {
        cartApi.remove(id).then(setCart).catch(() => {});
      } else {
        setCart((c) => c.filter((l) => l.productId !== id));
      }
      toast("Item removed from bag");
    },

    clearCart: () => {
      if (apiMode && user) cartApi.clear().then(() => setCart([])).catch(() => {});
      else setCart([]);
    },

    toggleWishlist: (p) => {
      const has = wishlist.includes(p.id);
      if (apiMode && user) {
        const action = has ? wishlistApi.remove(p.id) : wishlistApi.add(p.id);
        action.then(setWishlist).catch(() => {});
      } else {
        setWishlist((w) => (has ? w.filter((x) => x !== p.id) : [...w, p.id]));
      }
      toast(has ? `Removed ${p.name} from wishlist` : `Saved ${p.name} to wishlist`);
    },

    moveToCart: (p) => {
      if (p.stock === 0) return void toast.error(`${p.name} is out of stock`);
      addToCart(p, 1, true);
      if (apiMode && user) {
        wishlistApi.remove(p.id).then(setWishlist).catch(() => {});
      } else {
        setWishlist((w) => w.filter((x) => x !== p.id));
      }
      toast.success(`Moved ${p.name} to your bag`);
    },

    inWishlist: (id) => wishlist.includes(id),

    login: (u) => setUser(u),

    logout: () => {
      setToken(null);
      setUser(null);
      toast("Signed out");
    },

    updateUser: (u) => {
      setUser(u);
      if (apiMode) {
        authApi.updateMe({ name: u.name, ...(u.phone ? { phone: u.phone } : {}) }).catch(() => {});
      }
    },

    placeOrder: (o) => {
      setAllOrders((x) => [o, ...x]);
      setProducts((ps) =>
        ps.map((p) => {
          const it = o.items.find((i) => i.productId === p.id);
          return it ? { ...p, stock: Math.max(0, p.stock - it.quantity), sold: p.sold + it.quantity } : p;
        }),
      );
      setCart([]);
    },

    saveProduct: (p) =>
      setProducts((ps) => (ps.some((x) => x.id === p.id) ? ps.map((x) => (x.id === p.id ? p : x)) : [p, ...ps])),

    deleteProduct: (id) => {
      if (apiMode) {
        productsApi.delete(id).then(() => {
          setProducts((ps) => ps.filter((p) => p.id !== id));
          setCart((c) => c.filter((l) => l.productId !== id));
          setWishlist((w) => w.filter((x) => x !== id));
        }).catch(() => toast.error("Failed to delete product"));
      } else {
        setProducts((ps) => ps.filter((p) => p.id !== id));
        setCart((c) => c.filter((l) => l.productId !== id));
        setWishlist((w) => w.filter((x) => x !== id));
      }
    },

    updateOrderStatus: (id, status) => {
      if (apiMode) {
        ordersApi.updateStatus(id, status)
          .then(() => setAllOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o))))
          .catch(() => toast.error("Failed to update status"));
      } else {
        setAllOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o)));
      }
    },

    apiLogin,
    apiRegister,
    apiLogout,
    loadProducts,
    loadOrders,
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
