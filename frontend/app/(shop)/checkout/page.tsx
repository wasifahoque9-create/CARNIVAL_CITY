
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaArrowLeft,
  FaBoxOpen,
  FaCartShopping,
  FaCheck,
  FaChevronRight,
  FaCircleExclamation,
  FaCreditCard,
  FaDownload,
  FaFingerprint,
  FaHeadset,
  FaLocationDot,
  FaLock,
  FaMicrochip,
  FaMoneyBillWave,
  FaPlus,
  FaShieldHalved,
  FaStore,
  FaTruckFast,
  FaXmark,
} from "react-icons/fa6";

import { PageLoader } from "@/components/ui/Spinner";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import {
  addressApi,
  businessSettingsApi,
  cartApi,
  formatPrice,
  orderApi,
} from "@/lib/api";
import type {
  Address,
  Cart,
  CheckoutPayload,
  DeliveryMethod,
  Order,
} from "@/types";

type PaymentMethod = "cod" | "gateway";

const INITIAL_ADDRESS = {
  label: "Home",
  line1: "",
  line2: "",
  city: "",
  postal_code: "",
  country: "Bangladesh",
  is_default: true,
};

const INITIAL_GUEST = {
  guest_name: "",
  guest_email: "",
  guest_phone: "",
  guest_address_line1: "",
  guest_address_line2: "",
  guest_city: "",
  guest_postal_code: "",
  guest_country: "Bangladesh",
};

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
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

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { refreshCart } = useCart();

  const [cart, setCart] =
    useState<Cart | null>(null);

  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [addressId, setAddressId] =
    useState<number | "">("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<PaymentMethod>("cod");

  const [
    deliveryMethod,
    setDeliveryMethod,
  ] = useState<DeliveryMethod>(
    "home_delivery",
  );

  const [
    deliveryCharge,
    setDeliveryCharge,
  ] = useState(0);

  const [
    pickupAddress,
    setPickupAddress,
  ] = useState("");

  const [guest, setGuest] =
    useState(INITIAL_GUEST);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [
    savingAddress,
    setSavingAddress,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    showAddressForm,
    setShowAddressForm,
  ] = useState(false);

  const [newAddress, setNewAddress] =
    useState(INITIAL_ADDRESS);

  const [
    completedOrder,
    setCompletedOrder,
  ] = useState<Order | null>(null);

  const isGuest = !user;

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let pageIsActive = true;

    async function loadCheckoutData() {
      try {
        setLoading(true);
        setError("");

        if (user) {
          const [
            cartData,
            addressData,
            businessSettings,
          ] = await Promise.all([
            cartApi.get(),
            addressApi.list(),
            businessSettingsApi.get(),
          ]);

          if (!pageIsActive) return;

          setCart(cartData);
          setAddresses(addressData);

          setDeliveryCharge(
            Math.max(
              0,
              Number(
                businessSettings
                  .delivery_charge ?? 0,
              ),
            ),
          );

          setPickupAddress(
            businessSettings
              .business_address || "",
          );

          const defaultAddress =
            addressData.find(
              (address) =>
                address.is_default,
            ) ?? addressData[0];

          if (defaultAddress) {
            setAddressId(
              defaultAddress.id,
            );
          }
        } else {
          const [
            cartData,
            businessSettings,
          ] = await Promise.all([
            cartApi.get(),
            businessSettingsApi.get(),
          ]);

          if (!pageIsActive) return;

          setCart(cartData);
          setAddresses([]);
          setAddressId("");

          setDeliveryCharge(
            Math.max(
              0,
              Number(
                businessSettings
                  .delivery_charge ?? 0,
              ),
            ),
          );

          setPickupAddress(
            businessSettings
              .business_address || "",
          );
        }
      } catch (error) {
        console.error(
          "Checkout loading failed:",
          error,
        );

        if (pageIsActive) {
          setError(
            getErrorMessage(
              error,
              "Failed to load checkout data.",
            ),
          );
        }
      } finally {
        if (pageIsActive) {
          setLoading(false);
        }
      }
    }

    void loadCheckoutData();

    return () => {
      pageIsActive = false;
    };
  }, [authLoading, user]);

  const selectedAddress =
    useMemo(
      () =>
        addresses.find(
          (address) =>
            address.id === addressId,
        ) ?? null,
      [addresses, addressId],
    );

  const itemCount =
    cart?.items?.reduce(
      (total, item) =>
        total +
        Number(item.quantity ?? 0),
      0,
    ) ?? 0;

  const appliedDeliveryCharge =
    deliveryMethod === "home_delivery"
      ? deliveryCharge
      : 0;

  const finalOrderTotal =
    Number(cart?.total ?? 0) +
    appliedDeliveryCharge;

  async function handleAddAddress() {
    if (!user) {
      return;
    }

    if (!newAddress.line1.trim()) {
      setError(
        "Address Line 1 is required.",
      );
      return;
    }

    if (!newAddress.city.trim()) {
      setError("City is required.");
      return;
    }

    if (
      !newAddress.postal_code.trim()
    ) {
      setError(
        "Postal code is required.",
      );
      return;
    }

    if (!newAddress.country.trim()) {
      setError("Country is required.");
      return;
    }

    setSavingAddress(true);
    setError("");

    try {
      const created =
        await addressApi.create(
          newAddress,
        );

      setAddresses((current) => [
        ...current,
        created,
      ]);

      setAddressId(created.id);
      setShowAddressForm(false);
      setNewAddress(INITIAL_ADDRESS);
    } catch (error) {
      console.error(
        "Address creation failed:",
        error,
      );

      setError(
        getErrorMessage(
          error,
          "Failed to save address.",
        ),
      );
    } finally {
      setSavingAddress(false);
    }
  }

  function validateGuest(): boolean {
    if (!guest.guest_name.trim()) {
      setError("Full name is required.");
      return false;
    }

    if (!guest.guest_email.trim()) {
      setError("Email is required.");
      return false;
    }

    if (!guest.guest_phone.trim()) {
      setError("Phone number is required.");
      return false;
    }

    if (
      deliveryMethod ===
      "home_delivery"
    ) {
      if (
        !guest.guest_address_line1.trim()
      ) {
        setError(
          "Address Line 1 is required.",
        );
        return false;
      }

      if (!guest.guest_city.trim()) {
        setError("City is required.");
        return false;
      }

      if (
        !guest.guest_postal_code.trim()
      ) {
        setError(
          "Postal code is required.",
        );
        return false;
      }

      if (
        !guest.guest_country.trim()
      ) {
        setError(
          "Country is required.",
        );
        return false;
      }
    }

    return true;
  }

  async function handleCheckout(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!cart?.items?.length) {
      setError("Your cart is empty.");
      return;
    }

    if (
      user &&
      deliveryMethod ===
        "home_delivery" &&
      !addressId
    ) {
      setError(
        "Please select a shipping address.",
      );
      return;
    }

    if (!user && !validateGuest()) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload: CheckoutPayload =
        user
          ? {
              delivery_method:
                deliveryMethod,

              shipping_address_id:
                deliveryMethod ===
                "home_delivery"
                  ? Number(addressId)
                  : null,

              payment_method:
                paymentMethod,
            }
          : {
              delivery_method:
                deliveryMethod,

              guest_name:
                guest.guest_name,

              guest_email:
                guest.guest_email,

              guest_phone:
                guest.guest_phone,

              ...(deliveryMethod ===
              "home_delivery"
                ? {
                    guest_address_line1:
                      guest
                        .guest_address_line1,

                    guest_address_line2:
                      guest
                        .guest_address_line2,

                    guest_city:
                      guest.guest_city,

                    guest_postal_code:
                      guest
                        .guest_postal_code,

                    guest_country:
                      guest.guest_country,
                  }
                : {}),

              payment_method:
                paymentMethod,
            };

      const order =
        await orderApi.checkout(payload);

      await refreshCart();

      window.dispatchEvent(
        new Event("cart-updated"),
      );

      setCart((current) =>
        current
          ? {
              ...current,
              items: [],
              subtotal: 0,
              discount_total: 0,
              total: 0,
              item_count: 0,
            }
          : current,
      );

      if (user) {
        router.push(
          `/orders/${order.id}`,
        );
        return;
      }

      setCompletedOrder(order);
    } catch (error) {
      console.error(
        "Checkout failed:",
        error,
      );

      setError(
        getErrorMessage(
          error,
          "Checkout failed. Please try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loading) {
    return <PageLoader />;
  }

  if (completedOrder) {
    return (
      <OrderSuccess
        order={completedOrder}
      />
    );
  }

  if (!cart?.items?.length) {
    return <EmptyCheckout />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f5ff]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,19,88,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(18,19,88,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="pointer-events-none absolute -left-40 top-72 h-96 w-96 rounded-full bg-[#121358]/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-[#F59E0B]/10 blur-3xl" />

      <section className="relative overflow-hidden bg-gradient-to-r from-[#080a3d] via-[#121358] to-[#080a3d] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(73,91,255,0.22)_50%,transparent_51%),linear-gradient(transparent_49%,rgba(73,91,255,0.15)_50%,transparent_51%)] bg-[size:80px_80px]" />
        </div>

        <div className="pointer-events-none absolute -left-20 top-10 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2),transparent_65%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
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

            <Link
              href="/cart"
              className="transition hover:text-[#F59E0B]"
            >
              Cart
            </Link>

            <FaChevronRight size={9} />

            <span className="text-white">
              Checkout
            </span>
          </nav>

          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_520px] lg:items-center">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#F59E0B]/50 bg-[#F59E0B]/10 text-4xl text-[#F59E0B] shadow-[0_0_35px_rgba(245,158,11,0.25)]">
                <FaFingerprint />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F59E0B]">
                  Secure order processing
                </p>

                <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
                  Complete Your Checkout
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
                  {isGuest
                    ? "Checkout as a guest — no account required."
                    : "Confirm your shipping address and payment method before placing your order."}
                </p>
              </div>
            </div>

            <CheckoutProgress />
          </div>
        </div>
      </section>

      <form
        onSubmit={handleCheckout}
        className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
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
              onClick={() =>
                setError("")
              }
              className="flex shrink-0 items-center gap-2 rounded-xl bg-red-100 px-4 py-2 text-xs font-bold transition hover:bg-red-200"
            >
              <FaXmark />
              Close
            </button>
          </div>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-[#121358]/5">
              <SectionHeading
                number="01"
                eyebrow="Fulfilment option"
                title="Delivery Method"
                description="Choose Home Delivery or collect your order from the store."
              />

              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                <DeliveryMethodCard
                  selected={
                    deliveryMethod ===
                    "home_delivery"
                  }
                  icon={<FaTruckFast />}
                  title="Home Delivery"
                  description="Your order will be delivered to your selected address."
                  badge={
                    deliveryCharge > 0
                      ? formatPrice(
                          deliveryCharge,
                        )
                      : "Free"
                  }
                  onClick={() => {
                    setDeliveryMethod(
                      "home_delivery",
                    );
                    setError("");
                  }}
                />

                <DeliveryMethodCard
                  selected={
                    deliveryMethod ===
                    "pickup"
                  }
                  icon={<FaStore />}
                  title="Pickup from Store"
                  description="Collect your order from the store with no delivery charge."
                  badge="Free"
                  onClick={() => {
                    setDeliveryMethod(
                      "pickup",
                    );
                    setError("");
                    setShowAddressForm(
                      false,
                    );
                  }}
                />
              </div>

              {deliveryMethod ===
                "pickup" && (
                <div className="mx-5 mb-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 sm:mx-6 sm:mb-6">
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700">
                    <FaStore />
                    Store Pickup Location
                  </p>

                  <p className="mt-2 text-sm font-bold text-emerald-800">
                    {pickupAddress ||
                      "Store address will be confirmed by the business."}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-700/75">
                    Delivery charge for store pickup is 0.
                  </p>
                </div>
              )}
            </section>

            {user ? (
              deliveryMethod ===
              "home_delivery" ? (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-[#121358]/5">
                <SectionHeading
                  number="02"
                  eyebrow="Delivery information"
                  title="Shipping Address"
                  description="Select where you want your order delivered."
                  action={
                    <button
                      type="button"
                      onClick={() =>
                        setShowAddressForm(
                          (current) =>
                            !current,
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-[#121358]/15 px-4 py-2.5 text-sm font-bold text-[#121358] transition hover:border-[#F59E0B] hover:bg-[#F59E0B] hover:text-white"
                    >
                      {showAddressForm ? (
                        <>
                          <FaXmark size={12} />
                          Cancel
                        </>
                      ) : (
                        <>
                          <FaPlus size={12} />
                          Add New Address
                        </>
                      )}
                    </button>
                  }
                />

                <div className="p-5 sm:p-6">
                  {showAddressForm ? (
                    <div className="rounded-2xl border border-[#121358]/10 bg-[#f8f8ff] p-5 sm:p-6">
                      <div className="mb-5 flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#121358] text-[#F59E0B]">
                          <FaLocationDot />
                        </span>

                        <div>
                          <h3 className="font-black text-[#121358]">
                            Add Shipping Address
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            Enter your delivery information.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <CheckoutInput
                          label="Address Label"
                          value={newAddress.label}
                          onChange={(value) =>
                            setNewAddress(
                              (current) => ({
                                ...current,
                                label: value,
                              }),
                            )
                          }
                          placeholder="Home"
                        />

                        <CheckoutInput
                          label="Country"
                          required
                          value={newAddress.country}
                          onChange={(value) =>
                            setNewAddress(
                              (current) => ({
                                ...current,
                                country: value,
                              }),
                            )
                          }
                          placeholder="Bangladesh"
                        />

                        <CheckoutInput
                          label="Address Line 1"
                          required
                          value={newAddress.line1}
                          onChange={(value) =>
                            setNewAddress(
                              (current) => ({
                                ...current,
                                line1: value,
                              }),
                            )
                          }
                          placeholder="House, road or street"
                          className="sm:col-span-2"
                        />

                        <CheckoutInput
                          label="Address Line 2"
                          value={newAddress.line2}
                          onChange={(value) =>
                            setNewAddress(
                              (current) => ({
                                ...current,
                                line2: value,
                              }),
                            )
                          }
                          placeholder="Apartment, suite or floor"
                          className="sm:col-span-2"
                        />

                        <CheckoutInput
                          label="City"
                          required
                          value={newAddress.city}
                          onChange={(value) =>
                            setNewAddress(
                              (current) => ({
                                ...current,
                                city: value,
                              }),
                            )
                          }
                          placeholder="City"
                        />

                        <CheckoutInput
                          label="Postal Code"
                          required
                          value={
                            newAddress.postal_code
                          }
                          onChange={(value) =>
                            setNewAddress(
                              (current) => ({
                                ...current,
                                postal_code:
                                  value,
                              }),
                            )
                          }
                          placeholder="Postal code"
                        />
                      </div>

                      <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-[#121358]/10 bg-white px-4 py-3">
                        <input
                          type="checkbox"
                          checked={
                            newAddress.is_default
                          }
                          onChange={(event) =>
                            setNewAddress(
                              (current) => ({
                                ...current,
                                is_default:
                                  event.target
                                    .checked,
                              }),
                            )
                          }
                          className="h-4 w-4 accent-[#F59E0B]"
                        />

                        <span className="text-sm font-semibold text-[#121358]">
                          Save as my default address
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          void handleAddAddress()
                        }
                        disabled={
                          savingAddress
                        }
                        className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl bg-[#121358] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#292c82] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingAddress ? (
                          <>
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-[#F59E0B]" />
                            Saving Address...
                          </>
                        ) : (
                          <>
                            <FaCheck />
                            Save Address
                          </>
                        )}
                      </button>
                    </div>
                  ) : addresses.length === 0 ? (
                    <NoAddress
                      onAdd={() =>
                        setShowAddressForm(
                          true,
                        )
                      }
                    />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {addresses.map(
                        (address) => (
                          <AddressCard
                            key={address.id}
                            address={address}
                            selected={
                              addressId ===
                              address.id
                            }
                            onSelect={() =>
                              setAddressId(
                                address.id,
                              )
                            }
                          />
                        ),
                      )}
                    </div>
                  )}
                </div>
              </section>
              ) : null
            ) : (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-[#121358]/5">
                <SectionHeading
                  number="02"
                  eyebrow="Guest checkout"
                  title={
                    deliveryMethod ===
                    "home_delivery"
                      ? "Customer & Delivery Information"
                      : "Customer Information"
                  }
                  description={
                    deliveryMethod ===
                    "home_delivery"
                      ? "No account is required. Enter your customer and delivery information below."
                      : "No account is required. Enter your contact information for store pickup."
                  }
                />

                <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                  <CheckoutInput
                    label="Full Name"
                    required
                    value={guest.guest_name}
                    onChange={(value) =>
                      setGuest(
                        (current) => ({
                          ...current,
                          guest_name: value,
                        }),
                      )
                    }
                    placeholder="Your full name"
                  />

                  <CheckoutInput
                    label="Phone Number"
                    required
                    value={guest.guest_phone}
                    onChange={(value) =>
                      setGuest(
                        (current) => ({
                          ...current,
                          guest_phone: value,
                        }),
                      )
                    }
                    placeholder="01XXXXXXXXX"
                  />

                  <CheckoutInput
                    label="Email Address"
                    required
                    type="email"
                    value={guest.guest_email}
                    onChange={(value) =>
                      setGuest(
                        (current) => ({
                          ...current,
                          guest_email: value,
                        }),
                      )
                    }
                    placeholder="you@example.com"
                    className="sm:col-span-2"
                  />

                  {deliveryMethod ===
                    "home_delivery" && (
                    <>
                      <CheckoutInput
                        label="Address Line 1"
                        required
                        value={
                          guest.guest_address_line1
                        }
                        onChange={(value) =>
                          setGuest(
                            (current) => ({
                              ...current,
                              guest_address_line1:
                                value,
                            }),
                          )
                        }
                        placeholder="House, road or street"
                        className="sm:col-span-2"
                      />

                      <CheckoutInput
                        label="Address Line 2"
                        value={
                          guest.guest_address_line2
                        }
                        onChange={(value) =>
                          setGuest(
                            (current) => ({
                              ...current,
                              guest_address_line2:
                                value,
                            }),
                          )
                        }
                        placeholder="Apartment, suite or floor"
                        className="sm:col-span-2"
                      />

                      <CheckoutInput
                        label="City"
                        required
                        value={guest.guest_city}
                        onChange={(value) =>
                          setGuest(
                            (current) => ({
                              ...current,
                              guest_city: value,
                            }),
                          )
                        }
                        placeholder="City"
                      />

                      <CheckoutInput
                        label="Postal Code"
                        required
                        value={
                          guest.guest_postal_code
                        }
                        onChange={(value) =>
                          setGuest(
                            (current) => ({
                              ...current,
                              guest_postal_code:
                                value,
                            }),
                          )
                        }
                        placeholder="Postal code"
                      />

                      <CheckoutInput
                        label="Country"
                        required
                        value={
                          guest.guest_country
                        }
                        onChange={(value) =>
                          setGuest(
                            (current) => ({
                              ...current,
                              guest_country:
                                value,
                            }),
                          )
                        }
                        placeholder="Bangladesh"
                        className="sm:col-span-2"
                      />
                    </>
                  )}
                </div>
              </section>
            )}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-[#121358]/5">
              <SectionHeading
                number="03"
                eyebrow="Payment selection"
                title="Payment Method"
                description="Choose how you want to pay for this order."
              />

              <div className="p-5 sm:p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <PaymentCard
                    selected={
                      paymentMethod ===
                      "cod"
                    }
                    icon={
                      <FaMoneyBillWave />
                    }
                    title="Cash on Delivery"
                    description="Pay when your ShopSphere order arrives."
                    badge="Available"
                    onClick={() =>
                      setPaymentMethod(
                        "cod",
                      )
                    }
                  />

                  <PaymentCard
                    selected={
                      paymentMethod ===
                      "gateway"
                    }
                    icon={<FaCreditCard />}
                    title="Online Payment"
                    description="Continue using the configured payment gateway."
                    badge="Gateway"
                    onClick={() =>
                      setPaymentMethod(
                        "gateway",
                      )
                    }
                  />
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#121358]/10 bg-[#f4f5ff] px-4 py-3">
                  <FaShieldHalved className="mt-0.5 shrink-0 text-[#121358]" />

                  <p className="text-xs leading-5 text-slate-600">
                    Your order information is securely submitted through the ShopSphere Laravel backend.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-gradient-to-r from-[#121358] to-[#292c82] p-6 text-white shadow-xl">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl text-[#F59E0B]">
                    <FaCheck />
                  </span>

                  <div>
                    <h2 className="font-black">
                      Ready to place your order?
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-white/65">
                      Review your delivery information, payment method and order total before submitting.
                    </p>
                  </div>
                </div>

                <Link
                  href="/cart"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-bold transition hover:bg-white hover:text-[#121358]"
                >
                  <FaArrowLeft size={12} />
                  Return to Cart
                </Link>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-[#121358]/10">
              <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#2634a4] to-[#121358] text-white">
                  <FaMicrochip />
                </span>

                <div>
                  <h2 className="text-xl font-black text-[#121358]">
                    Order Summary
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {itemCount}{" "}
                    {itemCount === 1
                      ? "item"
                      : "items"}
                  </p>
                </div>
              </div>

              <div className="max-h-[360px] space-y-3 overflow-y-auto p-5">
                {cart.items.map(
                  (item) => (
                    <article
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
                    >
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-xl text-[#121358] shadow-sm">
                        <FaMicrochip />

                        <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#F59E0B] px-1 text-[9px] font-black text-white">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-[#121358]">
                          {item.product?.name ||
                            "Product"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Quantity:{" "}
                          {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-black text-[#121358]">
                        {formatPrice(
                          item.line_total,
                        )}
                      </p>
                    </article>
                  ),
                )}
              </div>

              <div className="border-t border-slate-100 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Payment
                  </span>

                  <span className="font-bold text-[#121358]">
                    {paymentMethod ===
                    "cod"
                      ? "Cash on Delivery"
                      : "Online Payment"}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Delivery
                  </span>

                  <span className="font-bold text-[#121358]">
                    {deliveryMethod ===
                    "home_delivery"
                      ? "Home Delivery"
                      : "Store Pickup"}
                  </span>
                </div>

                <div className="my-5 h-px bg-slate-200" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <span className="font-bold text-[#121358]">
                      {formatPrice(
                        Number(cart.total),
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Delivery Charge
                    </span>

                    <span className="font-bold text-[#121358]">
                      {appliedDeliveryCharge > 0
                        ? formatPrice(
                            appliedDeliveryCharge,
                          )
                        : "Free"}
                    </span>
                  </div>
                </div>

                <div className="my-5 h-px bg-slate-200" />

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-base font-black text-[#121358]">
                      Order Total
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Products + delivery charge
                    </p>
                  </div>

                  <p className="text-2xl font-black text-[#F59E0B]">
                    {formatPrice(
                      finalOrderTotal,
                    )}
                  </p>
                </div>

                {user &&
                  deliveryMethod ===
                    "home_delivery" &&
                  selectedAddress && (
                    <div className="mt-5 rounded-xl border border-[#121358]/10 bg-[#f8f8ff] p-4">
                      <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#121358]">
                        <FaLocationDot className="text-[#F59E0B]" />
                        Delivering to
                      </p>

                      <p className="mt-2 text-sm font-bold text-slate-700">
                        {selectedAddress.label ||
                          "Address"}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {
                          selectedAddress.line1
                        }
                        {selectedAddress.line2
                          ? `, ${selectedAddress.line2}`
                          : ""}
                        <br />
                        {
                          selectedAddress.city
                        }
                        ,{" "}
                        {
                          selectedAddress.postal_code
                        }
                        <br />
                        {
                          selectedAddress.country
                        }
                      </p>
                    </div>
                  )}

                {!user && (
                  <div className="mt-5 rounded-xl border border-[#121358]/10 bg-[#f8f8ff] p-4">
                    <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#121358]">
                      {deliveryMethod ===
                      "home_delivery" ? (
                        <FaLocationDot className="text-[#F59E0B]" />
                      ) : (
                        <FaStore className="text-[#F59E0B]" />
                      )}

                      Guest Checkout
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {deliveryMethod ===
                      "home_delivery"
                        ? "No login is required. Your delivery details will be attached to this order."
                        : "No login is required. Bring your order details when collecting from the store."}
                    </p>
                  </div>
                )}

                {deliveryMethod ===
                  "pickup" && (
                  <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                      <FaStore />
                      Pickup Location
                    </p>

                    <p className="mt-2 text-xs font-semibold leading-5 text-emerald-800">
                      {pickupAddress ||
                        "Store address will be confirmed by the business."}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    savingAddress ||
                    (Boolean(user) &&
                      deliveryMethod ===
                        "home_delivery" &&
                      !addressId)
                  }
                  className="group relative mt-5 flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-[#F59E0B] to-orange-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none disabled:hover:translate-y-0"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  {submitting ? (
                    <span className="relative h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <FaLock className="relative" />
                  )}

                  <span className="relative">
                    {submitting
                      ? "Processing Order..."
                      : "Place Order Securely"}
                  </span>

                  {!submitting && (
                    <FaChevronRight
                      size={11}
                      className="relative transition-transform group-hover:translate-x-1"
                    />
                  )}
                </button>

                <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                  <FaShieldHalved className="text-emerald-500" />
                  Secure backend order processing
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121358] text-white">
                  <FaHeadset />
                </span>

                <div>
                  <p className="text-xs font-black text-[#121358]">
                    Need help?
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Our support team is here.
                  </p>
                </div>
              </div>

              <Link
                href="/contact"
                className="shrink-0 rounded-lg border border-[#121358]/20 px-3 py-2 text-xs font-bold text-[#121358] transition hover:border-[#F59E0B] hover:bg-[#F59E0B] hover:text-white"
              >
                Contact Support
              </Link>
            </div>
          </aside>
        </div>

        <section className="mt-8 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          <TrustItem
            icon={<FaTruckFast />}
            title="Fast Delivery"
            description="Reliable and fast delivery"
          />

          <TrustItem
            icon={<FaShieldHalved />}
            title="Secure Checkout"
            description="Your data is protected"
          />

          <TrustItem
            icon={<FaMoneyBillWave />}
            title="Flexible Payment"
            description="COD or online gateway"
          />

          <TrustItem
            icon={<FaHeadset />}
            title="Customer Support"
            description="We are here to help"
          />
        </section>
      </form>
    </main>
  );
}

function CheckoutProgress() {
  return (
    <div className="relative rounded-2xl border border-white/15 bg-white/5 px-6 py-5 backdrop-blur-sm">
      <div className="absolute left-[16%] right-[16%] top-[38px] h-px bg-white/20" />

      <div className="relative grid grid-cols-3">
        <ProgressStep
          number="01"
          label="Cart"
          completed
        />

        <ProgressStep
          number="02"
          label="Details"
          active
        />

        <ProgressStep
          number="03"
          label="Complete"
        />
      </div>
    </div>
  );
}

type ProgressStepProps = {
  number: string;
  label: string;
  active?: boolean;
  completed?: boolean;
};

function ProgressStep({
  number,
  label,
  active = false,
  completed = false,
}: ProgressStepProps) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <span
        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-black ${
          active
            ? "border-[#F59E0B] bg-[#121358] text-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.45)]"
            : completed
              ? "border-[#F59E0B] bg-[#F59E0B] text-white"
              : "border-white/30 bg-[#121358] text-white/70"
        }`}
      >
        {completed ? (
          <FaCheck />
        ) : (
          number
        )}
      </span>

      <p
        className={`mt-2 text-xs font-bold ${
          active || completed
            ? "text-white"
            : "text-white/50"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

type SectionHeadingProps = {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

function SectionHeading({
  number,
  eyebrow,
  title,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-start gap-4">
        <span className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#2634a4] to-[#121358] text-xs font-black text-white">
          {number}
        </span>

        <div>
          <p className="text-xs font-semibold text-[#3845a5]">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-xl font-black text-[#121358]">
            {title}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {action}
    </div>
  );
}

type CheckoutInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  type?: "text" | "email" | "tel";
};

function CheckoutInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  type = "text",
}: CheckoutInputProps) {
  return (
    <label className={className}>
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
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/10"
      />
    </label>
  );
}

type AddressCardProps = {
  address: Address;
  selected: boolean;
  onSelect: () => void;
};

function AddressCard({
  address,
  selected,
  onSelect,
}: AddressCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative min-h-48 overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
        selected
          ? "border-[#F59E0B] bg-[#fffaf0] shadow-md"
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[#121358]/30 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
            selected
              ? "border-[#F59E0B]"
              : "border-slate-300"
          }`}
        >
          {selected && (
            <span className="h-3 w-3 rounded-full bg-[#F59E0B]" />
          )}
        </span>

        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#121358]">
          <FaLocationDot />
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h3 className="font-black text-[#121358]">
          {address.label ||
            "Address"}
        </h3>

        {address.is_default && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-700">
            Default
          </span>
        )}
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {address.line1}

        {address.line2 && (
          <>
            <br />
            {address.line2}
          </>
        )}

        <br />
        {address.city},{" "}
        {address.postal_code}
        <br />
        {address.country}
      </p>
    </button>
  );
}

type DeliveryMethodCardProps = {
  selected: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  badge: string;
  onClick: () => void;
};

function DeliveryMethodCard({
  selected,
  icon,
  title,
  description,
  badge,
  onClick,
}: DeliveryMethodCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative flex min-h-32 items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
        selected
          ? "border-[#F59E0B] bg-[#fffaf0] shadow-lg shadow-[#F59E0B]/10"
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[#121358]/30 hover:shadow-md"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected
            ? "border-[#F59E0B]"
            : "border-slate-300"
        }`}
      >
        {selected && (
          <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
        )}
      </span>

      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2634a4] to-[#121358] text-xl text-white">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-black text-[#121358]">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>

      <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-700">
        {badge}
      </span>
    </button>
  );
}

type PaymentCardProps = {
  selected: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  badge: string;
  onClick: () => void;
};

function PaymentCard({
  selected,
  icon,
  title,
  description,
  badge,
  onClick,
}: PaymentCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative flex min-h-28 items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
        selected
          ? "border-[#F59E0B] bg-[#fffaf0] shadow-lg shadow-[#F59E0B]/10"
          : "border-slate-200 bg-white hover:border-[#121358]/30"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected
            ? "border-[#F59E0B]"
            : "border-slate-300"
        }`}
      >
        {selected && (
          <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
        )}
      </span>

      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2634a4] to-[#121358] text-xl text-white">
        {icon}
      </span>

      <span className="min-w-0">
        <span className="block font-black text-[#121358]">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>

      <span className="ml-auto shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-700">
        {badge}
      </span>
    </button>
  );
}

type NoAddressProps = {
  onAdd: () => void;
};

function NoAddress({
  onAdd,
}: NoAddressProps) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-[#121358]/15 bg-[#f8f8ff] p-8 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#121358]/10 text-2xl text-[#121358]">
        <FaLocationDot />
      </span>

      <h3 className="mt-5 text-xl font-black text-[#121358]">
        No saved address
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Add a shipping address before continuing with checkout.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#121358] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#252875]"
      >
        <FaPlus />
        Add Shipping Address
      </button>
    </div>
  );
}

function OrderSuccess({
  order,
}: {
  order: Order;
}) {
  const [
    downloadingInvoice,
    setDownloadingInvoice,
  ] = useState(false);

  const [
    invoiceError,
    setInvoiceError,
  ] = useState("");

  async function handleDownloadInvoice() {
    if (downloadingInvoice) {
      return;
    }

    setDownloadingInvoice(true);
    setInvoiceError("");

    try {
      await orderApi.downloadInvoice(
        order.id,
      );
    } catch (error) {
      console.error(
        "Guest invoice download failed:",
        error,
      );

      setInvoiceError(
        getErrorMessage(
          error,
          "Unable to download your invoice. Please try again.",
        ),
      );
    } finally {
      setDownloadingInvoice(false);
    }
  }

  return (
    <main className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-[#f4f5ff] px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,19,88,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(18,19,88,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <section className="relative mx-auto w-full max-w-2xl rounded-3xl border border-white bg-white p-8 text-center shadow-2xl shadow-[#121358]/10 sm:p-14">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-3xl text-emerald-600">
          <FaCheck />
        </div>

        <p className="mt-7 text-xs font-black uppercase tracking-[0.22em] text-[#F59E0B]">
          Order completed
        </p>

        <h1 className="mt-3 text-3xl font-black text-[#121358]">
          Thank you for your order
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-500">
          Your guest order has been placed successfully.
          You can download the invoice now for your records.
        </p>

        <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-[#f4f5ff] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Order Number
          </p>

          <p className="mt-2 text-2xl font-black text-[#121358]">
            #{String(order.id).padStart(
              6,
              "0",
            )}
          </p>
        </div>

        {invoiceError && (
          <div
            role="alert"
            className="mx-auto mt-5 flex max-w-md items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-xs font-semibold leading-5 text-red-700"
          >
            <FaCircleExclamation className="mt-0.5 shrink-0" />
            <span>{invoiceError}</span>
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              void handleDownloadInvoice()
            }
            disabled={downloadingInvoice}
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#121358] px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-[#121358]/15 transition hover:-translate-y-1 hover:bg-[#292c82] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {downloadingInvoice ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Preparing Invoice...
              </>
            ) : (
              <>
                <FaDownload />
                Download Invoice
              </>
            )}
          </button>

          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-orange-500 px-7 py-3.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            Continue Shopping
            <FaChevronRight size={11} />
          </Link>
        </div>

        <p className="mx-auto mt-5 max-w-md text-xs leading-5 text-slate-400">
          Keep this invoice with your order number for
          future reference and support.
        </p>
      </section>
    </main>
  );
}

function EmptyCheckout() {
  return (
    <main className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-[#f4f5ff] px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,19,88,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(18,19,88,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <section className="relative mx-auto max-w-2xl rounded-3xl border border-white bg-white p-8 text-center shadow-2xl shadow-[#121358]/10 sm:p-14">
        <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 animate-pulse rounded-full bg-[#121358]/10" />

          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#121358] to-[#32358f] text-4xl text-white shadow-xl">
            <FaCartShopping />
          </div>

          <span className="absolute -right-1 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#F59E0B] text-sm font-black text-white">
            0
          </span>
        </div>

        <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-[#F59E0B]">
          Checkout unavailable
        </p>

        <h1 className="mt-3 text-3xl font-black text-[#121358]">
          Your cart is empty
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-500">
          Add products to your shopping cart before continuing to checkout.
        </p>

        <Link
          href="/products"
          className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-orange-500 px-7 py-3.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
        >
          <FaBoxOpen />
          Explore Products
          <FaChevronRight size={11} />
        </Link>
      </section>
    </main>
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
    <article className="group flex items-center gap-4 border-b border-slate-200 p-5 transition hover:bg-[#f8f8ff] sm:border-r lg:border-b-0">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#121358]/10 bg-white text-lg text-[#121358] transition group-hover:bg-[#121358] group-hover:text-[#F59E0B]">
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
