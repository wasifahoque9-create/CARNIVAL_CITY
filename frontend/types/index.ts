export type UserRole = "guest" | "customer" | "admin";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type ReviewStatus = "pending" | "approved" | "hidden";

export type CategoryType =
  | "laptop"
  | "pc"
  | "desktop"
  | "mobile"
  | "earbuds"
  | "accessory";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  addresses?: Address[];
  created_at?: string;
}

export interface Category {
  id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  type: CategoryType;
  children?: Category[];
  created_at?: string;
}

export interface ProductImage {
  id: number;
  image_path?: string;
  url?: string;
  is_primary: boolean;
}

export interface ProductVariant {
  id: number;
  variant_name: string;
  variant_value: string;
  price_adjustment: number;
  stock_qty: number;
  sku?: string | null;
}

export interface Product {
  id: number;
  category_id?: number;
  name: string;
  slug: string;
  brand?: string;
  description?: string | null;
  price: number;
  discount_price?: number | null;
  effective_price?: number;
  stock_qty?: number;
  status?: string;
  specifications?: Record<string, string | number | boolean> | null;
  warranty_months?: number | null;
  sku?: string | null;
  average_rating?: number | null;
  review_count?: number;
  category?: Category;
  categories?: Category[];
  images?: ProductImage[];
  variants?: ProductVariant[];
  created_at?: string;
}

export interface Review {
  id: number;
  product_id?: number;
  rating: number;
  comment: string;
  status: ReviewStatus;
  user?: Pick<User, "id" | "name">;
  product?: Pick<Product, "id" | "name" | "slug">;
  created_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  product_variant_id?: number | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  product?: Product;
  variant?: ProductVariant;
}

export interface Cart {
  id: number;
  items: CartItem[];
  subtotal: number;
  discount_total?: number;
  total: number;
  item_count: number;
}

export interface Address {
  id: number;
  label?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  line_total: number;
  product?: Product;
  variant?: ProductVariant;
}

export interface Payment {
  id: number;
  status: PaymentStatus;
  method: string;
  amount?: number;
  transaction_ref?: string | null;
}

export interface Order {
  id: number;
  user_id?: number;
  status: OrderStatus;
  total_amount: number;
  shipping_address_id?: number;
  shipping_address?: Address;
  items?: OrderItem[];
  payment?: Payment;
  created_at: string;
  updated_at?: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface DashboardStats {
  total_orders: number;
  total_revenue: number;
  total_products: number;
  total_customers: number;
  pending_reviews: number;
  recent_orders: Order[];
}

export interface ApiMessage {
  message: string;
}

export interface ProductFilters {
  search?: string;
  category_id?: number;
  category_slug?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  per_page?: number;
}

export interface ReviewsResponse {
  data: Review[];
  average_rating?: number;
  meta?: PaginationMeta;
}
