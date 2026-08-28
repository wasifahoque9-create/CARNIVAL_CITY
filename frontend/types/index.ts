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

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export type ReviewStatus =
  | "pending"
  | "approved"
  | "hidden";

export type CategoryType =
  | "laptop"
  | "pc"
  | "desktop"
  | "mobile"
  | "earbuds"
  | "accessory";

/*
|--------------------------------------------------------------------------
| User
|--------------------------------------------------------------------------
*/

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  addresses?: Address[];
  created_at?: string;
}

/*
|--------------------------------------------------------------------------
| Category
|--------------------------------------------------------------------------
*/

export interface Category {
  id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  type: CategoryType;
  children?: Category[];
  created_at?: string;
}

/*
|--------------------------------------------------------------------------
| Product
|--------------------------------------------------------------------------
*/

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

  specifications?:
    | Record<
        string,
        string | number | boolean
      >
    | null;

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

/*
|--------------------------------------------------------------------------
| Review
|--------------------------------------------------------------------------
*/

export interface Review {
  id: number;

  product_id?: number;

  rating: number;

  comment: string;

  status: ReviewStatus;

  user?: Pick<
    User,
    "id" | "name"
  >;

  product?: Pick<
    Product,
    "id" | "name" | "slug"
  >;

  created_at: string;
}

/*
|--------------------------------------------------------------------------
| Cart
|--------------------------------------------------------------------------
*/

export interface CartItem {
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
   *
   * Used by admin order list.
   * Works for both guest
   * and registered customers.
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
   * Final total:
   * cart amount + delivery charge
   */
  total_amount: number;

  /*
   * Delivery method
   */
  delivery_method:
    DeliveryMethod;

  /*
   * Home Delivery charge.
   * Pickup should be 0.
   */
  delivery_charge: number;

  /*
   * Logged-in customer's
   * saved delivery address.
   *
   * Pickup can be null.
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
   * Guest delivery address.
   *
   * These may be null
   * when Pickup is selected.
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
   * Order relations
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
| Checkout Payload
|--------------------------------------------------------------------------
|
| One interface supports:
|
| Logged-in + Home Delivery
| Logged-in + Pickup
| Guest + Home Delivery
| Guest + Pickup
|
*/

export interface CheckoutPayload {
  /*
   * Required:
   * home_delivery | pickup
   */
  delivery_method:
    DeliveryMethod;

  /*
   * Logged-in Home Delivery
   *
   * Pickup can send null
   * or omit this field.
   */
  shipping_address_id?:
    | number
    | null;

  /*
   * Guest customer info.
   *
   * Required by backend
   * for guest checkout.
   */
  guest_name?: string;

  guest_email?: string;

  guest_phone?: string;

  /*
   * Guest Home Delivery
   * address fields.
   *
   * Pickup does not need them.
   */
  guest_address_line1?: string;

  guest_address_line2?: string;

  guest_city?: string;

  guest_postal_code?: string;

  guest_country?: string;

  /*
   * Payment
   */
  payment_method:
    | "cod"
    | "gateway";

  gateway_payload?: Record<
    string,
    unknown
  >;
}

/*
|--------------------------------------------------------------------------
| Pagination
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

export interface AuthResponse {
  user: User;

  token: string;

  message?: string;
}

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

export interface DashboardStats {
  total_orders: number;

  total_revenue: number;

  total_products: number;

  total_customers: number;

  pending_reviews: number;

  recent_orders: Order[];
}

/*
|--------------------------------------------------------------------------
| API Message
|--------------------------------------------------------------------------
*/

export interface ApiMessage {
  message: string;
}

/*
|--------------------------------------------------------------------------
| Product Filters
|--------------------------------------------------------------------------
*/

export interface ProductFilters {
  search?: string;

  category_id?: number;

  category_slug?: string;

  min_price?: number;

  max_price?: number;

  page?: number;

  per_page?: number;
}

/*
|--------------------------------------------------------------------------
| Review Response
|--------------------------------------------------------------------------
*/

export interface ReviewsResponse {
  data: Review[];

  average_rating?: number;

  meta?: PaginationMeta;
}