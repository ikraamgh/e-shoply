import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import p7 from "@/assets/p7.jpg";
import hero from "@/assets/hero.jpg";

// Mock data — shapes mirror the future REST API resources.
export type Category = { id: string; name: string; image: string; count: number };
export type Product = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  compareAt?: number;
  categoryId: string;
  images: string[];
  rating: number;
  reviews: number;
  stock: number;
  sold: number;
  featured?: boolean;
};
export const ORDER_STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type OrderItem = { productId: string; name: string; price: number; quantity: number; image: string };
export type Order = {
  id: string;
  date: string;
  customer: string;
  email: string;
  status: OrderStatus;
  items: OrderItem[];
  shipping: number;
  total: number;
  address: string;
};
export type Customer = { id: string; name: string; email: string; orders: number; spent: number; joined: string };

export const categories: Category[] = [
  { id: "home", name: "Home & Kitchen", image: p1, count: 128 },
  { id: "travel", name: "Travel & Carry", image: p5, count: 64 },
  { id: "workspace", name: "Workspace", image: p6, count: 92 },
  { id: "wellness", name: "Wellness", image: p7, count: 76 },
];

const desc =
  "Designed in small batches and built to last. Each piece is made from responsibly sourced materials and finished by hand, so no two are exactly alike. Easy to care for and made to be used every day.";

export const products: Product[] = [
  { id: "ceramic-pour-over", name: "Ceramic Pour-Over", tagline: "Hand-glazed stoneware", price: 48, categoryId: "home", images: [p1, hero, p4], rating: 4.8, reviews: 214, stock: 24, sold: 940, featured: true, description: desc },
  { id: "steel-water-bottle", name: "Steel Water Bottle", tagline: "750ml, keeps cold 24h", price: 34, categoryId: "travel", images: [p2, p5], rating: 4.7, reviews: 388, stock: 56, sold: 1210, featured: true, description: desc },
  { id: "linen-cushion", name: "Linen Cushion", tagline: "Washed French linen", price: 56, compareAt: 70, categoryId: "home", images: [p3, hero], rating: 4.9, reviews: 132, stock: 4, sold: 860, featured: true, description: desc },
  { id: "sage-mug-set", name: "Sage Mug Set", tagline: "Set of two, 300ml", price: 42, categoryId: "home", images: [p4, p1], rating: 4.9, reviews: 501, stock: 38, sold: 1530, featured: true, description: desc },
  { id: "leather-tote", name: "Everyday Leather Tote", tagline: "Full-grain, vegetable tanned", price: 189, compareAt: 220, categoryId: "travel", images: [p5, p2], rating: 4.6, reviews: 97, stock: 12, sold: 410, description: desc },
  { id: "arc-desk-lamp", name: "Arc Desk Lamp", tagline: "Dimmable warm LED", price: 129, categoryId: "workspace", images: [p6], rating: 4.7, reviews: 76, stock: 0, sold: 320, description: desc },
  { id: "botanical-trio", name: "Botanical Skincare Trio", tagline: "Oil, serum & cream", price: 78, categoryId: "wellness", images: [p7], rating: 4.8, reviews: 245, stock: 31, sold: 780, description: desc },
  { id: "eucalyptus-vase", name: "Stone Bud Vase", tagline: "Textured ceramic", price: 38, categoryId: "home", images: [hero, p1], rating: 4.5, reviews: 63, stock: 19, sold: 290, description: desc },
  { id: "travel-flask", name: "Mini Travel Flask", tagline: "350ml, leakproof", price: 26, categoryId: "travel", images: [p2], rating: 4.4, reviews: 154, stock: 80, sold: 670, description: desc },
  { id: "desk-organizer", name: "Oak Desk Organizer", tagline: "Solid oak, three slots", price: 64, categoryId: "workspace", images: [p6, p5], rating: 4.6, reviews: 41, stock: 7, sold: 180, description: desc },
  { id: "face-oil", name: "Radiant Face Oil", tagline: "Jojoba + rosehip, 30ml", price: 32, compareAt: 40, categoryId: "wellness", images: [p7], rating: 4.7, reviews: 310, stock: 45, sold: 990, description: desc },
  { id: "linen-throw", name: "Washed Linen Throw", tagline: "Generous 130×180cm", price: 98, categoryId: "home", images: [p3], rating: 4.8, reviews: 88, stock: 15, sold: 350, description: desc },
  { id: "notebook-set", name: "Linen Notebook Set", tagline: "A5, dot grid, set of 3", price: 22, categoryId: "workspace", images: [p6], rating: 4.5, reviews: 120, stock: 64, sold: 540, description: desc },
  { id: "bath-salts", name: "Mineral Bath Soak", tagline: "Eucalyptus & sea salt", price: 24, categoryId: "wellness", images: [p7, hero], rating: 4.6, reviews: 72, stock: 3, sold: 260, description: desc },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const getCategory = (id: string) => categories.find((c) => c.id === id);

const item = (id: string, quantity: number): OrderItem => {
  const p = getProduct(id)!;
  return { productId: p.id, name: p.name, price: p.price, quantity, image: p.images[0] ?? "" };
};
const mk = (id: string, date: string, customer: string, email: string, status: OrderStatus, items: OrderItem[]): Order => {
  const sub = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = sub >= 75 ? 0 : 6;
  return { id, date, customer, email, status, items, shipping, total: sub + shipping, address: "24 Harbor Lane, Portland, OR 97201" };
};

export const orders: Order[] = [
  mk("SH-10428", "2026-09-28", "Alex Rivera", "alex@shoply.dev", "Processing", [item("sage-mug-set", 1), item("linen-cushion", 2)]),
  mk("SH-10397", "2026-09-14", "Alex Rivera", "alex@shoply.dev", "Shipped", [item("leather-tote", 1)]),
  mk("SH-10311", "2026-08-30", "Alex Rivera", "alex@shoply.dev", "Delivered", [item("ceramic-pour-over", 1), item("face-oil", 1)]),
  mk("SH-10255", "2026-08-02", "Alex Rivera", "alex@shoply.dev", "Cancelled", [item("arc-desk-lamp", 1)]),
  mk("SH-10431", "2026-10-01", "Mia Chen", "mia@example.com", "Pending", [item("botanical-trio", 2)]),
  mk("SH-10430", "2026-09-30", "Noah Patel", "noah@example.com", "Processing", [item("steel-water-bottle", 3)]),
  mk("SH-10429", "2026-09-29", "Sara Okafor", "sara@example.com", "Shipped", [item("linen-throw", 1), item("eucalyptus-vase", 1)]),
  mk("SH-10426", "2026-09-27", "Liam Novak", "liam@example.com", "Delivered", [item("desk-organizer", 1), item("notebook-set", 2)]),
];

export const customers: Customer[] = [
  { id: "c1", name: "Alex Rivera", email: "alex@shoply.dev", orders: 4, spent: 512, joined: "2025-03-11" },
  { id: "c2", name: "Mia Chen", email: "mia@example.com", orders: 7, spent: 845, joined: "2024-11-02" },
  { id: "c3", name: "Noah Patel", email: "noah@example.com", orders: 2, spent: 102, joined: "2026-06-19" },
  { id: "c4", name: "Sara Okafor", email: "sara@example.com", orders: 11, spent: 1390, joined: "2024-02-08" },
  { id: "c5", name: "Liam Novak", email: "liam@example.com", orders: 3, spent: 214, joined: "2025-09-23" },
];

export const salesByMonth = [
  { month: "Apr", sales: 12400, orders: 210 },
  { month: "May", sales: 15800, orders: 262 },
  { month: "Jun", sales: 14200, orders: 241 },
  { month: "Jul", sales: 18900, orders: 305 },
  { month: "Aug", sales: 21300, orders: 344 },
  { month: "Sep", sales: 24750, orders: 398 },
];

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);

export const SHIPPING_FREE_THRESHOLD = 75;
export const shippingFor = (subtotal: number) => (subtotal === 0 || subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : 6);
export { hero as heroImage };
