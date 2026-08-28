"use client";

import Link from "next/link";
import {
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  FaArrowLeft,
  FaBoxOpen,
  FaCartShopping,
  FaChevronRight,
  FaCircleExclamation,
  FaHeadset,
  FaLock,
  FaMicrochip,
  FaRotate,
  FaShieldHalved,
  FaTruckFast,
  FaWhatsapp,
  FaFileInvoiceDollar,
  FaPaperPlane,
  FaXmark,
  FaCheck,
  FaTrashCan,
  FaDownload,
} from "react-icons/fa6";

import CartItemRow from "@/components/cart/CartItemRow";
import { PageLoader } from "@/components/ui/Spinner";
import {
  ApiError,
  businessSettingsApi,
  cartApi,
  formatPrice,
  quotationApi,
} from "@/lib/api";
import type { Cart } from "@/types";


const WHATSAPP_COUNTRIES = [
  {
    code: "BD",
    name: "Bangladesh",
    dialCode: "880",
  },
  {
    code: "AU",
    name: "Australia",
    dialCode: "61",
  },
  {
    code: "US",
    name: "United States",
    dialCode: "1",
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "44",
  },
  {
    code: "IN",
    name: "India",
    dialCode: "91",
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "1",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "971",
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    dialCode: "966",
  },
  {
    code: "MY",
    name: "Malaysia",
    dialCode: "60",
  },
  {
    code: "SG",
    name: "Singapore",
    dialCode: "65",
  },
];

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error
  ) {
    const message = (
      error as { message?: unknown }
    ).message;

    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}

export default function CartPage() {
  const [cart, setCart] =
    useState<Cart | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");

  const [
    showClearCartConfirm,
    setShowClearCartConfirm,
  ] = useState(false);

  const [
    clearingCart,
    setClearingCart,
  ] = useState(false);

  const [
    showQuotationForm,
    setShowQuotationForm,
  ] = useState(false);

  const [
    submittingQuotation,
    setSubmittingQuotation,
  ] = useState(false);

  const [
    quotationSuccess,
    setQuotationSuccess,
  ] = useState("");

  const [
    quotationPdfId,
    setQuotationPdfId,
  ] = useState<number | null>(null);

  const [
    quotationCanDownload,
    setQuotationCanDownload,
  ] = useState(false);

  const [
    downloadingQuotationPdf,
    setDownloadingQuotationPdf,
  ] = useState(false);

  const [
    quotationForm,
    setQuotationForm,
  ] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    company_name: "",
    message: "",
  });

  const [
    showWhatsAppForm,
    setShowWhatsAppForm,
  ] = useState(false);

  const [
    whatsappCountry,
    setWhatsappCountry,
  ] = useState("BD");

  const [
    whatsappCustomerNumber,
    setWhatsappCustomerNumber,
  ] = useState("");

  const [
    businessWhatsAppCountryCode,
    setBusinessWhatsAppCountryCode,
  ] = useState("");

  const [
    businessWhatsAppNumber,
    setBusinessWhatsAppNumber,
  ] = useState("");

  const [
    businessSettingsLoading,
    setBusinessSettingsLoading,
  ] = useState(true);


  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await cartApi.get();

      setCart(data);
    } catch (error) {
      console.error(
        "Unable to load cart:",
        error,
      );

      setCart(null);

      setError(
        getErrorMessage(
          error,
          "Unable to load your shopping cart. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  useEffect(() => {
    let active = true;

    async function loadBusinessSettings() {
      try {
        setBusinessSettingsLoading(true);

        const settings =
          await businessSettingsApi.get();

        if (!active) {
          return;
        }

        setBusinessWhatsAppCountryCode(
          String(
            settings.whatsapp_country_code ?? "",
          ).replace(/\D/g, ""),
        );

        setBusinessWhatsAppNumber(
          String(
            settings.whatsapp_number ?? "",
          ),
        );
      } catch (error) {
        console.error(
          "Unable to load business settings:",
          error,
        );
      } finally {
        if (active) {
          setBusinessSettingsLoading(false);
        }
      }
    }

    void loadBusinessSettings();

    return () => {
      active = false;
    };
  }, []);

  async function handleUpdateQuantity(
    id: number,
    quantity: number,
  ) {
    if (
      quantity < 1 ||
      updatingId !== null
    ) {
      return;
    }

    setUpdatingId(id);
    setError("");

    try {
  const updatedCart =
    await cartApi.updateItem(
      id,
      quantity,
    );

  setCart(updatedCart);

  // Notify the navbar to refresh the cart count
  window.dispatchEvent(new Event("cart-updated"));
} catch (error) {
      console.error(
        "Unable to update cart item:",
        error,
      );

      setError(
        getErrorMessage(
          error,
          "Unable to update the product quantity.",
        ),
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRemove(
    id: number,
  ) {
    if (updatingId !== null) {
      return;
    }

    setUpdatingId(id);
    setError("");

try {
  const updatedCart =
    await cartApi.removeItem(id);

  setCart(updatedCart);

  // Notify the navbar to refresh the cart count
  window.dispatchEvent(new Event("cart-updated"));
} catch (error) {
      console.error(
        "Unable to remove cart item:",
        error,
      );

      setError(
        getErrorMessage(
          error,
          "Unable to remove this product from your cart.",
        ),
      );
    } finally {
      setUpdatingId(null);
    }
  }


  function openClearCartConfirm() {
    if (!cart?.items?.length) {
      return;
    }

    setError("");
    setShowClearCartConfirm(true);
  }

  function closeClearCartConfirm() {
    if (clearingCart) {
      return;
    }

    setShowClearCartConfirm(false);
  }

  async function handleClearCart() {
    if (!cart?.items?.length) {
      setShowClearCartConfirm(false);
      return;
    }

    try {
      setClearingCart(true);
      setError("");

      const updatedCart =
        await cartApi.clear();

      setCart(updatedCart);

      window.dispatchEvent(
        new Event("cart-updated"),
      );

      setShowClearCartConfirm(false);
    } catch (error) {
      console.error(
        "Unable to clear cart:",
        error,
      );

      setError(
        getErrorMessage(
          error,
          "Unable to clear your cart. Please try again.",
        ),
      );
    } finally {
      setClearingCart(false);
    }
  }


  function handleWhatsAppOrder() {
    if (!cart?.items?.length) {
      setError("Your cart is empty.");
      return;
    }

    if (businessSettingsLoading) {
      setError(
        "Business WhatsApp settings are still loading. Please try again.",
      );
      return;
    }

    if (
      !businessWhatsAppCountryCode ||
      !businessWhatsAppNumber
    ) {
      setError(
        "Business WhatsApp number is not configured. Please contact the store administrator.",
      );
      return;
    }

    setError("");
    setShowWhatsAppForm(true);
  }

  function closeWhatsAppForm() {
    setShowWhatsAppForm(false);
  }

  function continueToWhatsApp() {
    if (!cart?.items?.length) {
      setError("Your cart is empty.");
      setShowWhatsAppForm(false);
      return;
    }

    const localNumber =
      whatsappCustomerNumber.replace(
        /\D/g,
        "",
      );

    if (!localNumber) {
      setError(
        "Please enter your WhatsApp number.",
      );
      return;
    }

    const selectedCountry =
      WHATSAPP_COUNTRIES.find(
        (country) =>
          country.code ===
          whatsappCountry,
      );

    if (!selectedCountry) {
      setError(
        "Please select a valid country.",
      );
      return;
    }

    const normalizedLocalNumber =
      localNumber.replace(/^0+/, "");

    const customerWhatsAppNumber =
      `${selectedCountry.dialCode}${normalizedLocalNumber}`;

    const cleanBusinessCountryCode =
      businessWhatsAppCountryCode.replace(
        /\D/g,
        "",
      );

    const cleanBusinessNumber =
      businessWhatsAppNumber
        .replace(/\D/g, "")
        .replace(/^0+/, "");

    const destinationWhatsAppNumber =
      `${cleanBusinessCountryCode}${cleanBusinessNumber}`;

    if (!destinationWhatsAppNumber) {
      setError(
        "Business WhatsApp number is not configured.",
      );
      return;
    }

    const itemLines = cart.items.map(
      (item, index) => {
        const productName =
          item.product?.name ?? "Product";

        const quantity = Number(
          item.quantity ?? 1,
        );

        const unitPrice = Number(
          item.unit_price ?? 0,
        );

        const lineTotal = Number(
          item.line_total ??
            unitPrice * quantity,
        );

        return [
          `${index + 1}. ${productName}`,
          `Quantity: ${quantity}`,
          `Unit Price: ${formatPrice(unitPrice)}`,
          `Line Total: ${formatPrice(lineTotal)}`,
        ].join("\n");
      },
    );

    const message = [
      "Hello, I would like to place an order from ShopSphere.",
      "",
      `Customer WhatsApp: +${customerWhatsAppNumber}`,
      `Country: ${selectedCountry.name}`,
      "",
      ...itemLines.flatMap((item) => [
        item,
        "",
      ]),
      `Total Items: ${itemCount}`,
      `Grand Total: ${formatPrice(subtotal)}`,
      "",
      "Please confirm availability and delivery details.",
    ].join("\n");

    const url =
      `https://wa.me/${destinationWhatsAppNumber}?text=${encodeURIComponent(message)}`;

    setShowWhatsAppForm(false);

    window.open(
      url,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function openQuotationForm() {
    setError("");
    setQuotationSuccess("");
    setQuotationPdfId(null);
    setQuotationCanDownload(false);
    setShowQuotationForm(true);
  }

  function closeQuotationForm() {
    if (
      submittingQuotation ||
      downloadingQuotationPdf
    ) {
      return;
    }

    setShowQuotationForm(false);
    setQuotationSuccess("");
    setQuotationPdfId(null);
    setQuotationCanDownload(false);
  }

  async function handleQuotationSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!cart?.items?.length) {
      setError("Your cart is empty.");
      setShowQuotationForm(false);
      return;
    }

    if (!quotationForm.customer_name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!quotationForm.customer_phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    setSubmittingQuotation(true);
    setError("");
    setQuotationSuccess("");

    try {
      const response =
        await quotationApi.submit({
          customer_name:
            quotationForm.customer_name.trim(),

          customer_email:
            quotationForm.customer_email.trim() ||
            undefined,

          customer_phone:
            quotationForm.customer_phone.trim(),

          company_name:
            quotationForm.company_name.trim() ||
            undefined,

          message:
            quotationForm.message.trim() ||
            undefined,
        });

      setQuotationSuccess(
        `Quotation request #${String(
          response.data.id,
        ).padStart(
          6,
          "0",
        )} submitted successfully.`,
      );

      setQuotationPdfId(
        response.data.id,
      );

      setQuotationCanDownload(
        Boolean(response.data.user_id),
      );

      setQuotationForm({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        company_name: "",
        message: "",
      });
    } catch (error) {
      console.error(
        "Unable to submit quotation request:",
        error,
      );

      setError(
        getErrorMessage(
          error,
          "Unable to submit your quotation request. Please try again.",
        ),
      );
    } finally {
      setSubmittingQuotation(false);
    }
  }

  async function handleQuotationPdfDownload() {
    if (!quotationPdfId) {
      return;
    }

    try {
      setDownloadingQuotationPdf(true);
      setError("");

      await quotationApi.downloadPdf(
        quotationPdfId,
        false,
      );
    } catch (error) {
      console.error(
        "Unable to download quotation PDF:",
        error,
      );

      setError(
        getErrorMessage(
          error,
          "Unable to download your quotation PDF. Please try again.",
        ),
      );
    } finally {
      setDownloadingQuotationPdf(false);
    }
  }

  if (loading) {
    return <PageLoader />;
  }

  const isEmpty =
    !cart?.items?.length;

  const itemCount = Number(
    cart?.item_count ?? 0,
  );

  const subtotal = Number(
    cart?.subtotal ?? 0,
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f5ff]">
      {/* Technology grid background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,19,88,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(18,19,88,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-[#121358]/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-[#F59E0B]/10 blur-3xl" />

      {/* Page heading */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#121358] via-[#222475] to-[#121358] text-white">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.18),transparent_65%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-medium text-white/60"
          >
            <Link
              href="/"
              className="transition hover:text-[#F59E0B]"
            >
              Home
            </Link>

            <FaChevronRight size={9} />

            <span className="text-white">
              Shopping Cart
            </span>
          </nav>

          <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F59E0B] text-2xl shadow-xl shadow-black/20">
                <FaCartShopping />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#F59E0B]">
                  Your selected technology
                </p>

                <h1 className="mt-1 text-3xl font-black sm:text-4xl">
                  Shopping Cart
                </h1>

                <p className="mt-2 text-sm text-white/65">
                  Review your products before
                  proceeding to checkout.
                </p>
              </div>
            </div>

            {!isEmpty && (
              <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wider text-white/55">
                  Items selected
                </p>

                <p className="mt-1 text-2xl font-black text-[#F59E0B]">
                  {itemCount}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* API error */}
        {error && (
          <div
            role="alert"
            className="mb-7 flex flex-col items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-3">
              <FaCircleExclamation className="mt-0.5 shrink-0 text-lg" />

              <span className="font-medium">
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={() => void loadCart()}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-xs font-bold transition hover:bg-red-200"
            >
              <FaRotate />
              Retry
            </button>
          </div>
        )}

        {isEmpty ? (
          <EmptyCart />
        ) : (
          <>
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
              {/* Cart item list */}
              <section className="min-w-0">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F59E0B]">
                      Selected products
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-[#121358]">
                      Your Cart Items
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={openClearCartConfirm}
                      disabled={updatingId !== null || clearingCart}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FaTrashCan size={12} />
                      Clear Cart
                    </button>

                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 rounded-xl border border-[#121358]/15 bg-white px-4 py-2.5 text-sm font-bold text-[#121358] shadow-sm transition hover:border-[#F59E0B] hover:text-[#F59E0B]"
                    >
                      <FaArrowLeft size={12} />
                      Continue Shopping
                    </Link>
                  </div>
                </div>

                <div className="space-y-4">
                  {cart!.items.map(
                    (item, index) => {
                      const isUpdating =
                        updatingId === item.id;

                      return (
                        <article
                          key={item.id}
                          className={`group relative overflow-hidden rounded-3xl border-2 bg-white p-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#121358]/30 hover:shadow-xl hover:shadow-[#121358]/10 ${
                            isUpdating
                              ? "border-[#F59E0B]"
                              : "border-transparent"
                          }`}
                        >
                          {/* Product number */}
                          <div className="absolute left-3 top-3 z-10 flex h-7 min-w-7 items-center justify-center rounded-full bg-[#121358] px-2 text-[10px] font-black text-white shadow-md">
                            {String(
                              index + 1,
                            ).padStart(2, "0")}
                          </div>

                          {/* Decorative corner */}
                          <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 overflow-hidden">
                            <div className="absolute -right-12 -top-12 h-24 w-24 rotate-45 bg-gradient-to-br from-[#F59E0B]/20 to-transparent" />
                          </div>

                          {isUpdating && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/65 backdrop-blur-[2px]">
                              <div className="flex items-center gap-3 rounded-full bg-[#121358] px-5 py-3 text-xs font-bold text-white shadow-xl">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-[#F59E0B]" />

                                Updating cart...
                              </div>
                            </div>
                          )}

                          <CartItemRow
                            item={item}
                            onUpdateQuantity={
                              handleUpdateQuantity
                            }
                            onRemove={
                              handleRemove
                            }
                            updating={
                              isUpdating
                            }
                          />
                        </article>
                      );
                    },
                  )}
                </div>
              </section>

              {/* Summary */}
              <aside className="lg:sticky lg:top-28">
                <div className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-[#121358]/10">
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#121358] to-[#292c82] px-6 py-7 text-white">
                    <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#F59E0B]/20 blur-2xl" />

                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F59E0B]">
                          Checkout details
                        </p>

                        <h2 className="mt-2 text-2xl font-black">
                          Order Summary
                        </h2>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-xl">
                        <FaMicrochip />
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">
                          Items
                        </span>

                        <span className="font-bold text-[#121358]">
                          {itemCount}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">
                          Shipping
                        </span>

                        <span className="text-right text-xs font-bold text-emerald-600">
                          Calculated at checkout
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">
                          Payment protection
                        </span>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#121358]">
                          <FaShieldHalved className="text-[#F59E0B]" />
                          Included
                        </span>
                      </div>
                    </div>

                    <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                    <div className="rounded-2xl bg-[#f4f5ff] p-5">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Subtotal
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Taxes calculated later
                          </p>
                        </div>

                        <p className="text-2xl font-black text-[#F59E0B]">
                          {formatPrice(
                            subtotal,
                          )}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/checkout"
                      className="group relative mt-6 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#F59E0B] to-orange-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                      <FaLock className="relative" />

                      <span className="relative">
                        Proceed to Checkout
                      </span>

                      <FaChevronRight
                        size={11}
                        className="relative transition-transform group-hover:translate-x-1"
                      />
                    </Link>

                    <button
                      type="button"
                      onClick={handleWhatsAppOrder}
                      className="mt-3 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-5 py-4 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-1 hover:bg-[#1fbd5b] hover:shadow-xl"
                    >
                      <FaWhatsapp className="text-lg" />
                      <span>Order via WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={openQuotationForm}
                      className="mt-3 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#121358] bg-white px-5 py-4 text-sm font-black text-[#121358] shadow-sm transition hover:-translate-y-1 hover:bg-[#121358] hover:text-white hover:shadow-lg"
                    >
                      <FaFileInvoiceDollar className="text-lg" />
                      <span>Request Quotation</span>
                    </button>

                    <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                      <FaShieldHalved className="text-emerald-500" />
                      Secure and protected checkout
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#121358]/10 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#121358]/10 text-[#121358]">
                      <FaHeadset />
                    </div>

                    <div>
                      <p className="text-sm font-black text-[#121358]">
                        Need assistance?
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Our support team can help
                        with your order.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/contact"
                    className="mt-4 block rounded-xl border border-[#121358]/15 py-2.5 text-center text-xs font-bold text-[#121358] transition hover:border-[#F59E0B] hover:bg-[#F59E0B] hover:text-white"
                  >
                    Contact Support
                  </Link>
                </div>
              </aside>
            </div>

            <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <TrustItem
                icon={<FaTruckFast />}
                title="Fast Delivery"
                description="Reliable delivery service"
              />

              <TrustItem
                icon={<FaShieldHalved />}
                title="Secure Checkout"
                description="Protected order information"
              />

              <TrustItem
                icon={<FaRotate />}
                title="Easy Returns"
                description="Simple return experience"
              />

              <TrustItem
                icon={<FaHeadset />}
                title="Expert Support"
                description="Help whenever needed"
              />
            </section>
          </>
        )}
      </div>
      {showClearCartConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={closeClearCartConfirm}
            aria-hidden="true"
          />

          <section className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white bg-white shadow-2xl">
            <div className="p-6 text-center sm:p-8">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-600">
                <FaTrashCan />
              </span>

              <h2 className="mt-5 text-2xl font-black text-[#121358]">
                Clear your cart?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                This will remove all {itemCount} selected
                {itemCount === 1 ? " item" : " items"} from your cart.
              </p>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={closeClearCartConfirm}
                  disabled={clearingCart}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleClearCart()
                  }
                  disabled={clearingCart}
                  className="flex items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-500/20 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {clearingCart ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <FaTrashCan />
                  )}

                  {clearingCart
                    ? "Clearing..."
                    : "Yes, Clear Cart"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {showWhatsAppForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={closeWhatsAppForm}
            aria-hidden="true"
          />

          <section className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#25D366] text-xl text-white">
                  <FaWhatsapp />
                </span>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#25D366]">
                    WhatsApp order
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#121358]">
                    Enter Your WhatsApp Number
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={closeWhatsAppForm}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                aria-label="Close WhatsApp form"
              >
                <FaXmark />
              </button>
            </div>

            <div className="p-5 sm:p-7">
              <p className="text-sm leading-6 text-slate-500">
                Select your country and enter your WhatsApp number. Your cart details will then open in WhatsApp automatically.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-[190px_minmax(0,1fr)]">
                <label>
                  <span className="mb-2 block text-sm font-bold text-[#121358]">
                    Country
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </span>

                  <select
                    value={whatsappCountry}
                    onChange={(event) =>
                      setWhatsappCountry(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#25D366] focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  >
                    {WHATSAPP_COUNTRIES.map(
                      (country) => (
                        <option
                          key={country.code}
                          value={country.code}
                        >
                          {country.name} (+{country.dialCode})
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-[#121358]">
                    WhatsApp Number
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </span>

                  <input
                    type="tel"
                    value={
                      whatsappCustomerNumber
                    }
                    onChange={(event) =>
                      setWhatsappCustomerNumber(
                        event.target.value,
                      )
                    }
                    placeholder="01306712087"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#25D366] focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </label>
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Order Summary
                </p>

                <div className="mt-2 flex items-center justify-between gap-4 text-sm">
                  <span className="text-emerald-700">
                    {itemCount} item
                    {itemCount === 1 ? "" : "s"}
                  </span>

                  <span className="font-black text-emerald-700">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeWhatsAppForm}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={continueToWhatsApp}
                  className="flex items-center justify-center gap-3 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-[#1fbd5b] hover:shadow-xl"
                >
                  <FaWhatsapp className="text-lg" />
                  Continue to WhatsApp
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {showQuotationForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={closeQuotationForm}
            aria-hidden="true"
          />

          <section className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#121358] text-lg text-[#F59E0B]">
                  <FaFileInvoiceDollar />
                </span>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F59E0B]">
                    Business enquiry
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#121358]">
                    Request a Quotation
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={closeQuotationForm}
                disabled={submittingQuotation}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                aria-label="Close quotation form"
              >
                <FaXmark />
              </button>
            </div>

            <form
              onSubmit={handleQuotationSubmit}
              className="p-5 sm:p-7"
            >
              <div className="mb-6 rounded-2xl border border-[#121358]/10 bg-[#f4f5ff] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Selected Products
                    </p>

                    <p className="mt-1 text-sm font-black text-[#121358]">
                      {itemCount} item
                      {itemCount === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Estimated Total
                    </p>

                    <p className="mt-1 text-lg font-black text-[#F59E0B]">
                      {formatPrice(subtotal)}
                    </p>
                  </div>
                </div>
              </div>

              {quotationSuccess ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-xl text-emerald-600">
                    <FaCheck />
                  </span>

                  <h3 className="mt-4 text-xl font-black text-emerald-700">
                    Request Submitted
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-emerald-700">
                    {quotationSuccess}
                  </p>

                  {quotationCanDownload &&
                    quotationPdfId && (
                      <button
                        type="button"
                        onClick={() =>
                          void handleQuotationPdfDownload()
                        }
                        disabled={
                          downloadingQuotationPdf
                        }
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#121358] px-5 py-3 text-sm font-black text-white transition hover:bg-[#222475] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {downloadingQuotationPdf ? (
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        ) : (
                          <FaDownload />
                        )}

                        {downloadingQuotationPdf
                          ? "Preparing PDF..."
                          : "Download Quotation PDF"}
                      </button>
                    )}

                  {!quotationCanDownload && (
                    <p className="mx-auto mt-4 max-w-md text-xs leading-5 text-emerald-700/80">
                      Your quotation request was submitted successfully.
                      PDF download is available for signed-in customers.
                    </p>
                  )}

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={closeQuotationForm}
                      disabled={
                        downloadingQuotationPdf
                      }
                      className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <QuotationInput
                      label="Full Name"
                      required
                      value={
                        quotationForm.customer_name
                      }
                      onChange={(value) =>
                        setQuotationForm(
                          (current) => ({
                            ...current,
                            customer_name: value,
                          }),
                        )
                      }
                      placeholder="Your full name"
                    />

                    <QuotationInput
                      label="Phone Number"
                      required
                      type="tel"
                      value={
                        quotationForm.customer_phone
                      }
                      onChange={(value) =>
                        setQuotationForm(
                          (current) => ({
                            ...current,
                            customer_phone: value,
                          }),
                        )
                      }
                      placeholder="01XXXXXXXXX"
                    />

                    <QuotationInput
                      label="Email Address"
                      type="email"
                      value={
                        quotationForm.customer_email
                      }
                      onChange={(value) =>
                        setQuotationForm(
                          (current) => ({
                            ...current,
                            customer_email: value,
                          }),
                        )
                      }
                      placeholder="you@example.com"
                    />

                    <QuotationInput
                      label="Company Name"
                      value={
                        quotationForm.company_name
                      }
                      onChange={(value) =>
                        setQuotationForm(
                          (current) => ({
                            ...current,
                            company_name: value,
                          }),
                        )
                      }
                      placeholder="Optional"
                    />
                  </div>

                  <label className="mt-4 block">
                    <span className="mb-2 block text-sm font-bold text-[#121358]">
                      Additional Requirements
                      <span className="ml-1 font-normal text-slate-400">
                        (optional)
                      </span>
                    </span>

                    <textarea
                      rows={5}
                      value={
                        quotationForm.message
                      }
                      onChange={(event) =>
                        setQuotationForm(
                          (current) => ({
                            ...current,
                            message:
                              event.target.value,
                          }),
                        )
                      }
                      placeholder="Tell us about quantity, delivery, business requirements, or any special request..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#F59E0B] focus:bg-white focus:ring-4 focus:ring-[#F59E0B]/10"
                    />
                  </label>

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeQuotationForm}
                      disabled={submittingQuotation}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submittingQuotation}
                      className="flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#F59E0B] to-orange-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submittingQuotation ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      ) : (
                        <FaPaperPlane />
                      )}

                      {submittingQuotation
                        ? "Submitting..."
                        : "Submit Quotation Request"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </section>
        </div>
      )}

    </main>
  );
}

type QuotationInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "email" | "tel";
};

function QuotationInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}: QuotationInputProps) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-[#121358]">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#F59E0B] focus:bg-white focus:ring-4 focus:ring-[#F59E0B]/10"
      />
    </label>
  );
}

function EmptyCart() {
  return (
    <section className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-white bg-white p-8 text-center shadow-2xl shadow-[#121358]/10 sm:p-14">
      <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 animate-pulse rounded-full bg-[#121358]/10" />

        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#121358] to-[#32358f] text-4xl text-white shadow-xl">
          <FaBoxOpen />
        </div>

        <span className="absolute -right-1 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#F59E0B] text-sm font-black text-white shadow-lg">
          0
        </span>
      </div>

      <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-[#F59E0B]">
        Nothing selected yet
      </p>

      <h2 className="mt-3 text-3xl font-black text-[#121358]">
        Your cart is empty
      </h2>

      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-500">
        Explore our laptops, smartphones,
        accessories and smart devices, then add
        your favorite products to the cart.
      </p>

      <Link
        href="/products"
        className="mt-8 inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-orange-500 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-1 hover:shadow-xl"
      >
        <FaMicrochip />
        Explore Products
        <FaChevronRight size={11} />
      </Link>
    </section>
  );
}

type TrustItemProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

function TrustItem({
  icon,
  title,
  description,
}: TrustItemProps) {
  return (
    <article className="group flex items-center gap-4 rounded-2xl border-2 border-transparent bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#F59E0B]/40 hover:shadow-lg">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#121358]/10 text-lg text-[#121358] transition group-hover:bg-[#121358] group-hover:text-[#F59E0B]">
        {icon}
      </span>

      <div>
        <h3 className="text-sm font-black text-[#121358]">
          {title}
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </article>
  );
}