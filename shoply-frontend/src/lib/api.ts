/**
 * Shoply — Laravel API client
 * Base URL: http://localhost:8000/api/v1
 *
 * All requests include:
 *   - Accept: application/json
 *   - Authorization: Bearer <token>  (when logged in)
 */

export const API_BASE = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:8000/api/v1";

// ── Token storage ──────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("shoply.token");
export const setToken = (t: string | null) => {
  if (t) localStorage.setItem("shoply.token", t);
  else localStorage.removeItem("shoply.token");
};

// ── Core fetch helper ──────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body?.message ?? "Request failed", body);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Types (mirroring frontend types) ──────────────────────────────────────
export type ApiUser = { id: number; name: string; email: string; phone?: string; role: "customer" | "admin" };
export type ApiProduct = {
  id: string; name: string; tagline: string; description: string;
  price: number; compareAt?: number; categoryId: string;
  images: string[]; rating: number; reviews: number;
  stock: number; sold: number; featured?: boolean;
};
export type ApiCategory = { id: string; name: string; image: string; count: number };
export type ApiOrderItem = { productId: string; name: string; price: number; quantity: number; image: string };
export type ApiOrder = {
  id: string; date: string; customer: string; email: string;
  status: string; items: ApiOrderItem[];
  shipping: number; total: number; address: string;
};

// ── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string; phone?: string }) =>
    apiFetch<{ user: ApiUser; token: string }>("/register", { method: "POST", body: JSON.stringify(data) }),

  login: (email: string, password: string) =>
    apiFetch<{ user: ApiUser; token: string }>("/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  logout: () =>
    apiFetch<void>("/logout", { method: "POST" }),

  me: () =>
    apiFetch<ApiUser>("/me"),

  updateMe: (data: { name?: string; phone?: string }) =>
    apiFetch<ApiUser>("/me", { method: "PUT", body: JSON.stringify(data) }),
};

// ── Products ───────────────────────────────────────────────────────────────
export const productsApi = {
  list: (params?: { category?: string; featured?: boolean; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (params?.featured) qs.set("featured", "1");
    if (params?.search) qs.set("search", params.search);
    const q = qs.toString();
    return apiFetch<ApiProduct[]>(`/products${q ? `?${q}` : ""}`);
  },

  get: (slug: string) => apiFetch<ApiProduct>(`/products/${slug}`),

  create: (data: Partial<ApiProduct> & { slug: string }) =>
    apiFetch<ApiProduct>("/products", { method: "POST", body: JSON.stringify(data) }),

  update: (slug: string, data: Partial<ApiProduct>) =>
    apiFetch<ApiProduct>(`/products/${slug}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (slug: string) =>
    apiFetch<void>(`/products/${slug}`, { method: "DELETE" }),
};

// ── Categories ─────────────────────────────────────────────────────────────
export const categoriesApi = {
  list: () => apiFetch<ApiCategory[]>("/categories"),
};

// ── Orders ─────────────────────────────────────────────────────────────────
export const ordersApi = {
  list: () => apiFetch<ApiOrder[]>("/orders"),

  get: (orderNumber: string) => apiFetch<ApiOrder>(`/orders/${orderNumber}`),

  place: (data: {
    customer_name: string;
    customer_email: string;
    address: string;
    items: { productId: string; quantity: number }[];
  }) => apiFetch<ApiOrder>("/orders", { method: "POST", body: JSON.stringify(data) }),

  updateStatus: (orderNumber: string, status: string) =>
    apiFetch<ApiOrder>(`/orders/${orderNumber}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

// ── Cart ───────────────────────────────────────────────────────────────────
export const cartApi = {
  get: () => apiFetch<{ productId: string; quantity: number }[]>("/cart"),

  add: (productId: string, quantity = 1) =>
    apiFetch<{ productId: string; quantity: number }[]>("/cart", { method: "POST", body: JSON.stringify({ productId, quantity }) }),

  update: (productId: string, quantity: number) =>
    apiFetch<{ productId: string; quantity: number }[]>(`/cart/${productId}`, { method: "PATCH", body: JSON.stringify({ quantity }) }),

  remove: (productId: string) =>
    apiFetch<{ productId: string; quantity: number }[]>(`/cart/${productId}`, { method: "DELETE" }),

  clear: () =>
    apiFetch<[]>("/cart", { method: "DELETE" }),
};

// ── Wishlist ───────────────────────────────────────────────────────────────
export const wishlistApi = {
  get: () => apiFetch<string[]>("/wishlist"),

  add: (productId: string) =>
    apiFetch<string[]>("/wishlist", { method: "POST", body: JSON.stringify({ productId }) }),

  remove: (productId: string) =>
    apiFetch<string[]>(`/wishlist/${productId}`, { method: "DELETE" }),
};

// ── Admin Users ────────────────────────────────────────────────────────────
export const usersApi = {
  list: () => apiFetch<ApiUser[]>("/users"),
};
