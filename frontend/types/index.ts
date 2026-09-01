export type UserRole =
  | "guest"
  | "customer"
  | "admin";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type DeliveryMethod =
  | "home_delivery"
  | "pickup";

export type DeliveryStatus =
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export type ReviewStatus =
  | "pending"
  | "approved"
  | "hidden";

export interface User {
  password_set: any;
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

  /*
   * Category image returned by the Laravel API.
   *
   * If an image was uploaded:
   * image_url contains the complete public URL.
   *
   * If no image was uploaded:
   * image_url is null.
   *
   * The frontend should leave the image area blank
   * when image_url is null.
   */
  image_url?: string | null;

  children?: Category[];
  created_at?: string;
}

export interface ProductImage {
  id: number;
  image_path?: string;
  url?: string;
  thumbnail_url?: string;
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
  specifications?: Record<
    string,
    string | number | boolean
  > | null;
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
  product?: Pick<
    Product,
    "id" | "name" | "slug"
  >;
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

/*
|--------------------------------------------------------------------------
| Address
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Order Item
|--------------------------------------------------------------------------
*/

export interface OrderItem {
  id: number;

  product_id: number;

  product_variant_id?:
    | number
    | null;

  quantity: number;

  unit_price: number;

  line_total: number;

  product?: Product;

  variant?: ProductVariant;
}

/*
|--------------------------------------------------------------------------
| Payment
|--------------------------------------------------------------------------
*/

export interface Payment {
  id: number;

  status: PaymentStatus;

  method: string;

  amount?: number;

  transaction_ref?:
    | string
    | null;
}

/*
|--------------------------------------------------------------------------
| Order
|--------------------------------------------------------------------------
|
| Supports:
|
| - Logged-in customer orders
| - Guest customer orders
| - Home Delivery
| - Store Pickup
| - Delivery Tracking
|
*/

export interface Order {
  id: number;

  /*
   * Logged-in customer
   */
  user_id?:
    | number
    | null;

  /*
   * Customer summary
   */
  customer_name?:
    | string
    | null;

  customer_email?:
    | string
    | null;

  customer_type?:
    | "guest"
    | "registered";

  /*
   * Order state
   */
  status: OrderStatus;

  /*
   * Final total
   */
  total_amount: number;

  /*
   * Delivery method
   */
  delivery_method:
    DeliveryMethod;

  /*
   * Delivery charge
   */
  delivery_charge: number;

  /*
   * Delivery Tracking
   *
   * Used only for Home Delivery.
   */
  delivery_person_name?:
    | string
    | null;

  delivery_person_phone?:
    | string
    | null;

  tracking_number?:
    | string
    | null;

  delivery_status?:
    | DeliveryStatus
    | null;

  delivery_note?:
    | string
    | null;

  delivery_updated_at?:
    | string
    | null;

  /*
   * Logged-in customer's
   * saved shipping address.
   */
  shipping_address_id?:
    | number
    | null;

  shipping_address?:
    | Address
    | null;

  /*
   * Guest customer data
   */
  guest_name?:
    | string
    | null;

  guest_email?:
    | string
    | null;

  guest_phone?:
    | string
    | null;

  /*
   * Guest delivery address
   */
  guest_address_line1?:
    | string
    | null;

  guest_address_line2?:
    | string
    | null;

  guest_city?:
    | string
    | null;

  guest_postal_code?:
    | string
    | null;

  guest_country?:
    | string
    | null;

  guest_token?:
    | string
    | null;

  /*
   * Relations
   */
  items?: OrderItem[];

  payment?: Payment;

  user?:
    | User
    | null;

  /*
   * Timestamps
   */
  created_at: string;

  updated_at?: string;
}

/*
|--------------------------------------------------------------------------
| Delivery Tracking Update Payload
|--------------------------------------------------------------------------
*/

export interface DeliveryTrackingPayload {
  delivery_person_name?:
    | string
    | null;

  delivery_person_phone?:
    | string
    | null;

  tracking_number?:
    | string
    | null;

  delivery_status:
    DeliveryStatus;

  delivery_note?:
    | string
    | null;
}

/*
|--------------------------------------------------------------------------
| Checkout Payload
|--------------------------------------------------------------------------
*/

export interface CheckoutPayload {
  delivery_method:
    DeliveryMethod;

  shipping_address_id?:
    | number
    | null;

  guest_name?: string;

  guest_email?: string;

  guest_phone?: string;

  guest_address_line1?: string;

  guest_address_line2?: string;

  guest_city?: string;

  guest_postal_code?: string;

  guest_country?: string;

  payment_method:
    | "cod"
    | "gateway";

  gateway_payload?: Record<
    string,
    unknown
  >;
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