import type {
  Address,
  ApiMessage,
  AuthResponse,
  Cart,
  Category,
  PaginationMeta,
  CheckoutPayload,
  DashboardStats,
  DeliveryTrackingPayload,
  Order,
  PaginatedResponse,
  Product,
  ProductFilters,
  ProductVariant,
  Review,
  ReviewsResponse,
  User,
} from "@/types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

export const STORAGE_BASE =
  process.env.NEXT_PUBLIC_STORAGE_URL ||
  "http://localhost:8000/storage";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/*
|--------------------------------------------------------------------------
| Authentication token
|--------------------------------------------------------------------------
*/

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}

export function setToken(
  token: string | null,
): void {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

/*
|--------------------------------------------------------------------------
| Guest cart token
|--------------------------------------------------------------------------
|
| Guest customers do not have an authentication token.
|
| We create a permanent browser-specific cart token and store it
| inside localStorage.
|
| This token is sent to Laravel through:
|
| X-Guest-Cart-Token
|
*/

const GUEST_CART_TOKEN_KEY =
  "guest_cart_token";

function createGuestCartToken(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}-${Math.random()
    .toString(36)
    .substring(2)}`;
}

export function getGuestCartToken():
  | string
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  let token = localStorage.getItem(
    GUEST_CART_TOKEN_KEY,
  );

  if (!token) {
    token = createGuestCartToken();

    localStorage.setItem(
      GUEST_CART_TOKEN_KEY,
      token,
    );
  }

  return token;
}

export function clearGuestCartToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(
    GUEST_CART_TOKEN_KEY,
  );
}

/*
|--------------------------------------------------------------------------
| Query-string helper
|--------------------------------------------------------------------------
*/

function buildQuery(
  params?: Record<
    string,
    string | number | boolean | undefined
  >,
): string {
  if (!params) {
    return "";
  }

  const searchParams =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        searchParams.set(
          key,
          String(value),
        );
      }
    },
  );

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

/*
|--------------------------------------------------------------------------
| Main API request helper
|--------------------------------------------------------------------------
|
| Supports:
|
| - JSON requests
| - FormData requests
| - Bearer authentication
| - Guest shopping cart token
| - Laravel validation errors
|
*/

export async function api<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const guestCartToken =
    getGuestCartToken();

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers = new Headers(
    options.headers,
  );

  headers.set(
    "Accept",
    "application/json",
  );

  /*
   * Do not manually set Content-Type for FormData.
   * Browser automatically sets multipart boundary.
   */
  if (!isFormData) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  /*
   * Logged-in customer/admin token.
   */
  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  /*
   * Guest cart identifier.
   *
   * Logged-in users can also send this header.
   * Laravel CartService will prioritize the user
   * whenever an authenticated user exists.
   */
  if (guestCartToken) {
    headers.set(
      "X-Guest-Cart-Token",
      guestCartToken,
    );
  }

  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      ...options,
      headers,
    },
  );

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({}));

    throw new ApiError(
      response.status,
      body.message ||
        "Something went wrong.",
      body.errors,
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

/*
|--------------------------------------------------------------------------
| API response helper
|--------------------------------------------------------------------------
*/

function unwrap<T>(
  payload: T | { data: T },
): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload
  ) {
    return (
      payload as {
        data: T;
      }
    ).data;
  }

  return payload as T;
}

/*
|--------------------------------------------------------------------------
| Product helpers
|--------------------------------------------------------------------------
*/

export function getProductPrice(
  product: Product,
  variant?: ProductVariant | null,
): number {
  const basePrice = Number(
    product.discount_price ??
      product.effective_price ??
      product.price,
  );

  if (
    variant &&
    "price_adjustment" in variant
  ) {
    return (
      basePrice +
      Number(
        variant.price_adjustment ?? 0,
      )
    );
  }

  return basePrice;
}

export function getVariantLabel(
  variant: ProductVariant,
): string {
  return `${variant.variant_name}: ${variant.variant_value}`;
}

export function getProductImage(
  product: Product,
): string {
  const images =
    product.images ?? [];

  const selectedImage =
    images.find(
      (image) => image.is_primary,
    ) ?? images[0];

  if (!selectedImage) {
    return "/placeholder-product.svg";
  }

  /*
   * Backend may already provide
   * a full public image URL.
   */
  if (selectedImage.url) {
    return selectedImage.url;
  }

  if (selectedImage.image_path) {
    if (
      selectedImage.image_path.startsWith(
        "http://",
      ) ||
      selectedImage.image_path.startsWith(
        "https://",
      )
    ) {
      return selectedImage.image_path;
    }

    const cleanPath =
      selectedImage.image_path
        .replace(/\\/g, "/")
        .replace(/^\/+/, "")
        .replace(/^storage\//, "");

    return `${STORAGE_BASE}/${cleanPath}`;
  }

  return "/placeholder-product.svg";
}

export function formatPrice(
  amount: number,
): string {
  return new Intl.NumberFormat(
    "en-BD",
    {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    },
  ).format(amount);
}

export function formatOrderNumber(
  order: Pick<Order, "id">,
): string {
  return `#${String(order.id).padStart(
    6,
    "0",
  )}`;
}
/*
|--------------------------------------------------------------------------
| Banner helpers
|--------------------------------------------------------------------------
*/

export function getBannerImage(
  banner: { image_path: string | null },
): string | null {
  if (!banner.image_path) {
    return null;
  }

  if (
    banner.image_path.startsWith("http://") ||
    banner.image_path.startsWith("https://")
  ) {
    return banner.image_path;
  }

  const cleanPath = banner.image_path
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^storage\//, "");

  return `${STORAGE_BASE}/${cleanPath}`;
}

/*
|--------------------------------------------------------------------------
| Banner API
|--------------------------------------------------------------------------
*/

export const bannerApi = {
  getActive: () =>
    api<
      Array<{
        id: number;
        tag: string | null;
        title: string;
        highlight: string | null;
        description: string | null;
        price: number | null;
        discount_text: string | null;
        cta_text: string | null;
        cta_link: string | null;
        secondary_cta_text: string | null;
        secondary_cta_link: string | null;
        image_path: string | null;
        fallback_emoji: string;
        sort_order: number;
        is_active: boolean;
      }> | {
        data: Array<{
          id: number;
          tag: string | null;
          title: string;
          highlight: string | null;
          description: string | null;
          price: number | null;
          discount_text: string | null;
          cta_text: string | null;
          cta_link: string | null;
          secondary_cta_text: string | null;
          secondary_cta_link: string | null;
          image_path: string | null;
          fallback_emoji: string;
          sort_order: number;
          is_active: boolean;
        }>;
      }
    >("/banners").then(unwrap),
};
/*
|--------------------------------------------------------------------------
| Authentication API
|--------------------------------------------------------------------------
*/

export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
  }) =>
    api<AuthResponse>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),

  login: (data: {
    email: string;
    password: string;
  }) =>
    api<AuthResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),

  logout: () =>
    api<ApiMessage>(
      "/auth/logout",
      {
        method: "POST",
      },
    ),

  forgotPassword: (data: {
    email: string;
  }) =>
    api<ApiMessage>(
      "/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),

  getUser: async (): Promise<User> => {
    const response = await api<{
      user: User;
    }>("/users/me");

    return response.user;
  },
};

/*
|--------------------------------------------------------------------------
| Customer catalog API
|--------------------------------------------------------------------------
*/

export const catalogApi = {
  getCategories: () =>
    api<
      Category[] | {
        data: Category[];
      }
    >("/categories").then(unwrap),

  getFeaturedProducts: () =>
    api<PaginatedResponse<Product>>(
      "/products?per_page=8",
    ).then(
      (response) => response.data,
    ),

  getProducts: (
    filters?: ProductFilters,
  ) =>
    api<
      PaginatedResponse<Product>
    >(
      `/products${buildQuery(
        filters as Record<
          string,
          | string
          | number
          | boolean
          | undefined
        >,
      )}`,
    ),

  getCategoryProducts: (
    slug: string,
    filters?: ProductFilters,
  ) =>
    api<
      PaginatedResponse<Product>
    >(
      `/products${buildQuery({
        ...(filters as Record<
          string,
          | string
          | number
          | boolean
          | undefined
        >),
        category_slug: slug,
      })}`,
    ),

  getProduct: (
    slugOrId: string | number,
  ) =>
    api<
      Product | {
        data: Product;
      }
    >(
      `/products/${slugOrId}`,
    ).then(unwrap),

  search: (
    search: string,
    page = 1,
  ) =>
    api<
      PaginatedResponse<Product>
    >(
      `/products${buildQuery({
        search,
        page,
      })}`,
    ),

  getProductReviews: async (
    slugOrId: string | number,
  ): Promise<Review[]> => {
    const response =
      await api<ReviewsResponse>(
        `/reviews/product/${slugOrId}`,
      );

    return response.data;
  },

  createReview: (
    productId: number,
    data: {
      rating: number;
      comment: string;
    },
  ) =>
    api<
      Review | {
        data: Review;
      }
    >("/reviews", {
      method: "POST",
      body: JSON.stringify({
        product_id: productId,
        ...data,
      }),
    }).then(unwrap),
};

/*
|--------------------------------------------------------------------------
| Cart API
|--------------------------------------------------------------------------
|
| Works for:
|
| - Logged-in customers
| - Guest customers
|
| Guest identity is automatically provided through:
| X-Guest-Cart-Token
|
*/

export const cartApi = {
  get: async (): Promise<Cart> => {
    const response = await api<{
      cart: {
        id: number;
        items: Cart["items"];
      };
      subtotal: number;
      discount_total: number;
      total: number;
      item_count: number;
    }>("/cart");

    return {
      id: response.cart.id,
      items:
        response.cart.items ?? [],
      subtotal:
        Number(response.subtotal ?? 0),
      discount_total: Number(
        response.discount_total ?? 0,
      ),
      total:
        Number(response.total ?? 0),
      item_count: Number(
        response.item_count ?? 0,
      ),
    };
  },

  addItem: async (data: {
    product_id: number;
    product_variant_id?:
      | number
      | null;
    quantity: number;
  }): Promise<Cart> => {
    await api("/cart/add", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return cartApi.get();
  },

  updateItem: async (
    cartItemId: number,
    quantity: number,
  ): Promise<Cart> => {
    await api(
      "/cart/update",
      {
        method: "PUT",
        body: JSON.stringify({
          cart_item_id:
            cartItemId,
          quantity,
        }),
      },
    );

    return cartApi.get();
  },

  removeItem: async (
    cartItemId: number,
  ): Promise<Cart> => {
    await api(
      "/cart/remove",
      {
        method: "DELETE",
        body: JSON.stringify({
          cart_item_id:
            cartItemId,
        }),
      },
    );

    return cartApi.get();
  },

  clear: async (): Promise<Cart> => {
    await api(
      "/cart/clear",
      {
        method: "DELETE",
      },
    );

    return cartApi.get();
  },
};

/*
|--------------------------------------------------------------------------
| Profile API
|--------------------------------------------------------------------------
*/

export const profileApi = {
  update: (data: {
    name?: string;
    email?: string;
    phone?: string;
    addresses?: Partial<Address>[];
  }) =>
    api<{
      user: User;
    }>(
      "/users/profile",
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    ).then(
      (response) => response.user,
    ),

  changePassword: (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) =>
    api<ApiMessage>(
      "/users/change-password",
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    ),
};

/*
|--------------------------------------------------------------------------
| Address API
|--------------------------------------------------------------------------
*/

export const addressApi = {
  list: async (): Promise<
    Address[]
  > => {
    const user =
      await authApi.getUser();

    return user.addresses ?? [];
  },

  create: async (
    data: Omit<Address, "id">,
  ) => {
    const user =
      await profileApi.update({
        addresses: [data],
      });

    return user.addresses?.slice(
      -1,
    )[0] as Address;
  },
};

/*
|--------------------------------------------------------------------------
| Order API
|--------------------------------------------------------------------------
|
| This section is still authenticated-user based.
| Guest checkout will be updated in the next step.
|
*/

export const orderApi = {
  /*
  |--------------------------------------------------------------------------
  | Order List
  |--------------------------------------------------------------------------
  |
  | Logged-in customers/admin only.
  |
  */

  list: (page = 1) =>
    api<PaginatedResponse<Order>>(
      `/orders${buildQuery({
        page,
      })}`,
    ),

  /*
  |--------------------------------------------------------------------------
  | Single Order
  |--------------------------------------------------------------------------
  |
  | Logged-in customers/admin only.
  |
  */

  get: (
    id: number | string,
  ) =>
    api<
      Order | {
        data: Order;
      }
    >(
      `/orders/${id}`,
    ).then(unwrap),

  /*
  |--------------------------------------------------------------------------
  | Guest Order Details / Tracking
  |--------------------------------------------------------------------------
  |
  | Guest customers can view only the order that matches
  | their browser's X-Guest-Cart-Token.
  |
  */

  getGuest: (
    id: number | string,
  ) =>
    api<
      Order | {
        data: Order;
      }
    >(
      `/guest/orders/${id}`,
    ).then(unwrap),

  /*
  |--------------------------------------------------------------------------
  | Checkout
  |--------------------------------------------------------------------------
  |
  | Supports both logged-in and guest checkout.
  |
  | The main api() helper automatically sends:
  | - Authorization: Bearer <token> for logged-in users
  | - X-Guest-Cart-Token for guest cart/order identity
  |
  */

  checkout: (
    data: CheckoutPayload,
  ) =>
    api<
      Order | {
        data: Order;
      }
    >(
      "/orders",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ).then(unwrap),

  /*
  |--------------------------------------------------------------------------
  | Cancel Order
  |--------------------------------------------------------------------------
  |
  | Logged-in customer only.
  |
  */

  cancel: (
    id: number | string,
  ) =>
    api<
      Order | {
        data: Order;
      }
    >(
      `/orders/${id}/cancel`,
      {
        method: "PUT",
      },
    ).then(unwrap),
};


/*
|--------------------------------------------------------------------------
| Quotation API
|--------------------------------------------------------------------------
|
| Guest and logged-in customers can submit quotation requests.
| The main api() helper automatically sends X-Guest-Cart-Token.
|
*/

export type QuotationRequestPayload = {
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  company_name?: string;
  message?: string;
};

export type QuotationRequestResponse = {
  id: number;
  user_id?: number | null;
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string;
  company_name?: string | null;
  message?: string | null;
  estimated_total: number | string;
  quoted_amount?: number | string | null;
  admin_note?: string | null;
  status:
    | "pending"
    | "reviewed"
    | "quoted"
    | "accepted"
    | "rejected";
  created_at?: string;
  updated_at?: string;
  items?: Array<{
    id: number;
    quotation_request_id: number;
    product_id: number;
    product_variant_id?: number | null;
    product_name: string;
    variant_name?: string | null;
    quantity: number;
    unit_price: number | string;
    line_total: number | string;
  }>;
};

export const quotationApi = {
  submit: (
    data: QuotationRequestPayload,
  ) =>
    api<{
      message: string;
      data: QuotationRequestResponse;
    }>(
      "/quotations",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),

  adminList: (
    page = 1,
    status?: string,
  ) =>
    api<{
      data: QuotationRequestResponse[];
      meta: PaginationMeta;
    }>(
      `/admin/quotations${buildQuery({
        page,
        status,
      })}`,
    ),

  adminGet: (
    id: number | string,
  ) =>
    api<{
      data: QuotationRequestResponse;
    }>(
      `/admin/quotations/${id}`,
    ).then((response) => response.data),

  adminUpdate: (
    id: number | string,
    data: {
      status:
        | "pending"
        | "reviewed"
        | "quoted"
        | "accepted"
        | "rejected";
      quoted_amount?: number | null;
      admin_note?: string | null;
    },
  ) =>
    api<{
      message: string;
      data: QuotationRequestResponse;
    }>(
      `/admin/quotations/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    ),
};

/*
|--------------------------------------------------------------------------
| Admin API
|--------------------------------------------------------------------------
*/

export const adminApi = {
  dashboard: () =>
    api<DashboardStats>(
      "/admin/dashboard",
    ),

  products: {
    list: (params?: {
      page?: number;
      per_page?: number;
      search?: string;
      category_id?: number;
      status?: string;
      sort_by?:
        | "name"
        | "price"
        | "stock_qty"
        | "created_at";
      sort_direction?:
        | "asc"
        | "desc";
    }) =>
      api<
        PaginatedResponse<Product>
      >(
        `/admin/products${buildQuery(
          {
            page:
              params?.page ?? 1,
            per_page:
              params?.per_page ??
              20,
            search:
              params?.search,
            category_id:
              params?.category_id,
            status:
              params?.status,
            sort_by:
              params?.sort_by,
            sort_direction:
              params?.sort_direction,
          },
        )}`,
      ),

    get: (id: number) =>
      api<
        Product | {
          data: Product;
        }
      >(
        `/admin/products/${id}`,
      ).then(unwrap),

    create: (
      data:
        | FormData
        | Record<
            string,
            unknown
          >,
    ) =>
      api<
        Product | {
          data: Product;
        }
      >(
        "/admin/products",
        {
          method: "POST",
          body:
            typeof FormData !==
              "undefined" &&
            data instanceof FormData
              ? data
              : JSON.stringify(
                  data,
                ),
        },
      ).then(unwrap),

    update: (
      id: number,
      data:
        | FormData
        | Record<
            string,
            unknown
          >,
    ) => {
      const isFormData =
        typeof FormData !==
          "undefined" &&
        data instanceof FormData;

      /*
       * Laravel/PHP can have
       * difficulty processing
       * multipart PUT requests.
       *
       * For FormData use:
       *
       * POST + _method=PUT
       */
      if (isFormData) {
        if (!data.has("_method")) {
          data.append(
            "_method",
            "PUT",
          );
        }

        return api<
          Product | {
            data: Product;
          }
        >(
          `/admin/products/${id}`,
          {
            method: "POST",
            body: data,
          },
        ).then(unwrap);
      }

      return api<
        Product | {
          data: Product;
        }
      >(
        `/admin/products/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(
            data,
          ),
        },
      ).then(unwrap);
    },

    delete: (id: number) =>
      api<ApiMessage>(
        `/admin/products/${id}`,
        {
          method: "DELETE",
        },
      ),
  },

  categories: {
    list: () =>
      api<
        | Category[]
        | {
            data: Category[];
          }
      >(
        "/categories",
      ).then(unwrap),

    create: (
      data: Partial<Category>,
    ) =>
      api<
        | Category
        | {
            data: Category;
          }
      >(
        "/categories",
        {
          method: "POST",
          body: JSON.stringify(
            data,
          ),
        },
      ).then(unwrap),

    update: (
      id: number,
      data: Partial<Category>,
    ) =>
      api<
        | Category
        | {
            data: Category;
          }
      >(
        `/categories/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(
            data,
          ),
        },
      ).then(unwrap),

    delete: (id: number) =>
      api<ApiMessage>(
        `/categories/${id}`,
        {
          method: "DELETE",
        },
      ),
  },
  banners: {
    list: () =>
      api<Banner[] | { data: Banner[] }>(
        "/admin/banners",
      ).then(unwrap),

    create: (data: FormData) =>
      api<Banner | { data: Banner }>(
        "/admin/banners",
        {
          method: "POST",
          body: data,
        },
      ).then(unwrap),

    update: (id: number, data: FormData) => {
      if (!data.has("_method")) {
        data.append("_method", "PUT");
      }

      return api<Banner | { data: Banner }>(
        `/admin/banners/${id}`,
        {
          method: "POST",
          body: data,
        },
      ).then(unwrap);
    },

    delete: (id: number) =>
      api<ApiMessage>(
        `/admin/banners/${id}`,
        {
          method: "DELETE",
        },
      ),
  },
  orders: {
    /*
    |--------------------------------------------------------------------------
    | Admin Order List
    |--------------------------------------------------------------------------
    */

    list: (
      page = 1,
      status?: string,
    ) =>
      api<
        PaginatedResponse<Order>
      >(
        `/orders${buildQuery({
          page,
          status,
        })}`,
      ),

    /*
    |--------------------------------------------------------------------------
    | Update Main Order Status
    |--------------------------------------------------------------------------
    */

    updateStatus: (
      id: number,
      status: string,
    ) =>
      api<
        | Order
        | {
            data: Order;
          }
      >(
        `/orders/${id}/status`,
        {
          method: "PUT",
          body: JSON.stringify({
            status,
          }),
        },
      ).then(unwrap),

    /*
    |--------------------------------------------------------------------------
    | Update Delivery Tracking
    |--------------------------------------------------------------------------
    |
    | Home Delivery only.
    |
    | Shipped
    |   ↓
    | In Transit
    |   ↓
    | Out for Delivery
    |   ↓
    | Delivered
    |
    */

    updateDeliveryTracking: (
      id: number,
      data: DeliveryTrackingPayload,
    ) =>
      api<
        | Order
        | {
            data: Order;
          }
      >(
        `/orders/${id}/delivery-tracking`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        },
      ).then(unwrap),
  },

  reviews: {
    list: (
      page = 1,
      status?: string,
    ) =>
      api<
        PaginatedResponse<Review>
      >(
        `/admin/reviews${buildQuery(
          {
            page,
            status,
          },
        )}`,
      ),

    moderate: (
      id: number,
      status:
        | "approved"
        | "hidden",
    ) =>
      api<
        | Review
        | {
            data: Review;
          }
      >(
        `/reviews/${id}/moderate`,
        {
          method: "PUT",
          body: JSON.stringify({
            status,
          }),
        },
      ).then(unwrap),
  },
};

/*
|--------------------------------------------------------------------------
| Business Settings API
|--------------------------------------------------------------------------
|
| Public storefront can read business information.
| Only authenticated admins can update it.
|
*/

export type BusinessSettings = {
  id: number;
  business_name: string;
  business_email?: string | null;
  business_phone?: string | null;
  whatsapp_country_code: string;
  whatsapp_number?: string | null;
  business_address?: string | null;
  currency: string;
  facebook_url?: string | null;
  instagram_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type BusinessSettingsPayload = {
  business_name: string;
  business_email?: string | null;
  business_phone?: string | null;
  whatsapp_country_code: string;
  whatsapp_number: string;
  business_address?: string | null;
  currency: string;
  facebook_url?: string | null;
  instagram_url?: string | null;
};

export const businessSettingsApi = {
  get: () =>
    api<{
      data: BusinessSettings;
    }>("/business-settings").then(
      (response) => response.data,
    ),

  update: (
    data: BusinessSettingsPayload,
  ) =>
    api<{
      message: string;
      data: BusinessSettings;
    }>("/admin/business-settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
