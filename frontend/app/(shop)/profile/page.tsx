"use client";

import {
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaAddressBook,
  FaCheck,
  FaCircleCheck,
  FaCircleExclamation,
  FaEnvelope,
  FaFloppyDisk,
  FaHouse,
  FaIdBadge,
  FaLocationDot,
  FaLock,
  FaPenToSquare,
  FaPhone,
  FaPlus,
  FaShieldHalved,
  FaUser,
  FaUserShield,
  FaXmark,
} from "react-icons/fa6";

import { PageLoader } from "@/components/ui/Spinner";
import {
  useAuth,
  useRequireAuth,
} from "@/lib/auth";
import {
  addressApi,
  profileApi,
} from "@/lib/api";
import type { Address } from "@/types";

const ADMIN_IMAGE =
  "/profile/admin-profile.jpg";

const INITIAL_ADDRESS = {
  label: "Home",
  line1: "",
  line2: "",
  city: "",
  postal_code: "",
  country: "Bangladesh",
  is_default: false,
};

type MessageState = {
  type: "success" | "error";
  text: string;
} | null;

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

export default function ProfilePage() {
  const {
    user,
    loading: authLoading,
  } = useRequireAuth();

  const {
    refreshUser,
    isAdmin,
  } = useAuth();

  const [profile, setProfile] =
    useState({
      name: "",
      email: "",
      phone: "",
    });

  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    savingAddress,
    setSavingAddress,
  ] = useState(false);

  const [
    showAddressForm,
    setShowAddressForm,
  ] = useState(false);

  const [
    imageFailed,
    setImageFailed,
  ] = useState(false);

  const [message, setMessage] =
    useState<MessageState>(null);

  const [newAddress, setNewAddress] =
    useState(INITIAL_ADDRESS);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    let pageIsActive = true;

    async function loadProfile() {
      try {
        setLoading(true);

     if (!user) {
  return;
}

setProfile({
  name: user.name ?? "",
  email: user.email ?? "",
  phone: user.phone ?? "",
});

        const addressData =
          await addressApi.list();

        if (pageIsActive) {
          setAddresses(addressData);
        }
      } catch (error) {
        console.error(
          "Unable to load profile:",
          error,
        );

        if (pageIsActive) {
          setMessage({
            type: "error",
            text: getErrorMessage(
              error,
              "Unable to load your saved addresses.",
            ),
          });
        }
      } finally {
        if (pageIsActive) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      pageIsActive = false;
    };
  }, [authLoading, user]);

  const defaultAddress = useMemo(
    () =>
      addresses.find(
        (address) =>
          Boolean(address.is_default),
      ) ?? null,
    [addresses],
  );

  async function handleProfileSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!profile.name.trim()) {
      setMessage({
        type: "error",
        text: "Your name is required.",
      });

      return;
    }

    if (!profile.email.trim()) {
      setMessage({
        type: "error",
        text: "Your email address is required.",
      });

      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await profileApi.update({
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
      });

      await refreshUser();

      setMessage({
        type: "success",
        text: "Your profile was updated successfully.",
      });
    } catch (error) {
      console.error(
        "Profile update failed:",
        error,
      );

      setMessage({
        type: "error",
        text: getErrorMessage(
          error,
          "Failed to update your profile.",
        ),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleAddAddress(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!newAddress.line1.trim()) {
      setMessage({
        type: "error",
        text: "Address Line 1 is required.",
      });

      return;
    }

    if (!newAddress.city.trim()) {
      setMessage({
        type: "error",
        text: "City is required.",
      });

      return;
    }

    if (
      !newAddress.postal_code.trim()
    ) {
      setMessage({
        type: "error",
        text: "Postal code is required.",
      });

      return;
    }

    if (!newAddress.country.trim()) {
      setMessage({
        type: "error",
        text: "Country is required.",
      });

      return;
    }

    setSavingAddress(true);
    setMessage(null);

    try {
      const created =
        await addressApi.create({
          label:
            newAddress.label.trim() ||
            "Address",
          line1:
            newAddress.line1.trim(),
          line2:
            newAddress.line2.trim(),
          city:
            newAddress.city.trim(),
          postal_code:
            newAddress.postal_code.trim(),
          country:
            newAddress.country.trim(),
          is_default:
            newAddress.is_default,
        });

      setAddresses((current) => {
        if (created.is_default) {
          return [
            ...current.map(
              (address) => ({
                ...address,
                is_default: false,
              }),
            ),
            created,
          ];
        }

        return [...current, created];
      });

      setNewAddress(
        INITIAL_ADDRESS,
      );

      setShowAddressForm(false);

      setMessage({
        type: "success",
        text: "Your new address was saved successfully.",
      });
    } catch (error) {
      console.error(
        "Address creation failed:",
        error,
      );

      setMessage({
        type: "error",
        text: getErrorMessage(
          error,
          "Failed to add the address.",
        ),
      });
    } finally {
      setSavingAddress(false);
    }
  }

  if (authLoading || loading) {
    return <PageLoader />;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f5ff]">
      {/* Technology grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,19,88,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(18,19,88,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="pointer-events-none absolute -left-40 top-52 h-96 w-96 rounded-full bg-[#121358]/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-[#F59E0B]/10 blur-3xl" />

      {/* Profile hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#080a3d] via-[#121358] to-[#080a3d] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(73,91,255,0.22)_50%,transparent_51%),linear-gradient(transparent_49%,rgba(73,91,255,0.15)_50%,transparent_51%)] bg-[size:80px_80px]" />
        </div>

        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2),transparent_65%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#F59E0B]/50 bg-[#F59E0B]/10 text-3xl text-[#F59E0B] shadow-[0_0_35px_rgba(245,158,11,0.25)]">
                {isAdmin ? (
                  <FaUserShield />
                ) : (
                  <FaUser />
                )}
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F59E0B]">
                  Account management
                </p>

                <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                  My Profile
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
                  Manage your personal
                  information, contact details and
                  saved delivery addresses.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <ProfileHeroStat
                label="Account"
                value={
                  isAdmin
                    ? "Administrator"
                    : "Customer"
                }
              />

              <ProfileHeroStat
                label="Addresses"
                value={String(
                  addresses.length,
                )}
              />

              <ProfileHeroStat
                label="Status"
                value="Active"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
        {/* Message */}
        {message && (
          <div
            role="alert"
            className={`mb-7 flex items-start justify-between gap-4 rounded-2xl border px-5 py-4 text-sm shadow-sm ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <div className="flex items-start gap-3">
              {message.type ===
              "success" ? (
                <FaCircleCheck className="mt-0.5 shrink-0 text-lg" />
              ) : (
                <FaCircleExclamation className="mt-0.5 shrink-0 text-lg" />
              )}

              <span className="font-medium">
                {message.text}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setMessage(null)
              }
              aria-label="Close message"
              className="shrink-0 rounded-lg p-1 transition hover:bg-black/5"
            >
              <FaXmark />
            </button>
          </div>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
          {/* Forms */}
          <div className="space-y-7">
            {/* Account form */}
            <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-2xl shadow-[#121358]/10">
              <SectionHeader
                icon={<FaIdBadge />}
                eyebrow="Personal information"
                title="Account Details"
                description="Update the information associated with your account."
              />

              <form
                onSubmit={
                  handleProfileSubmit
                }
                className="p-6 sm:p-8"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <ProfileInput
                    label="Full Name"
                    icon={<FaUser />}
                    value={profile.name}
                    onChange={(value) =>
                      setProfile(
                        (current) => ({
                          ...current,
                          name: value,
                        }),
                      )
                    }
                    placeholder="Enter your full name"
                    required
                    className="sm:col-span-2"
                  />

                  <ProfileInput
                    label="Email Address"
                    icon={<FaEnvelope />}
                    type="email"
                    value={profile.email}
                    onChange={(value) =>
                      setProfile(
                        (current) => ({
                          ...current,
                          email: value,
                        }),
                      )
                    }
                    placeholder="name@example.com"
                    required
                  />

                  <ProfileInput
                    label="Phone Number"
                    icon={<FaPhone />}
                    type="tel"
                    value={profile.phone}
                    onChange={(value) =>
                      setProfile(
                        (current) => ({
                          ...current,
                          phone: value,
                        }),
                      )
                    }
                    placeholder="+880..."
                  />
                </div>

                <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#121358]/10 bg-[#f8f8ff] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <FaShieldHalved className="mt-0.5 shrink-0 text-[#F59E0B]" />

                    <p className="text-xs leading-5 text-slate-600">
                      Your personal information is
                      securely stored and used to
                      manage your ShopSphere
                      account.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#121358] to-[#292c82] px-6 py-3 text-sm font-black text-white shadow-lg shadow-[#121358]/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-[#F59E0B]" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaFloppyDisk />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* Addresses */}
            <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-2xl shadow-[#121358]/10">
              <SectionHeader
                icon={
                  <FaAddressBook />
                }
                eyebrow="Delivery locations"
                title="Saved Addresses"
                description="Manage the locations used for checkout and delivery."
                action={
                  <button
                    type="button"
                    onClick={() =>
                      setShowAddressForm(
                        (current) =>
                          !current,
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-[#121358]/15 bg-white px-4 py-2.5 text-sm font-bold text-[#121358] transition hover:border-[#F59E0B] hover:bg-[#F59E0B] hover:text-white"
                  >
                    {showAddressForm ? (
                      <>
                        <FaXmark />
                        Cancel
                      </>
                    ) : (
                      <>
                        <FaPlus />
                        Add Address
                      </>
                    )}
                  </button>
                }
              />

              <div className="p-6 sm:p-8">
                {showAddressForm && (
                  <form
                    onSubmit={
                      handleAddAddress
                    }
                    className="mb-7 rounded-2xl border border-[#121358]/10 bg-[#f8f8ff] p-5 sm:p-6"
                  >
                    <div className="mb-5 flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#121358] text-[#F59E0B]">
                        <FaLocationDot />
                      </span>

                      <div>
                        <h3 className="font-black text-[#121358]">
                          New Delivery Address
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Enter a new location for
                          future orders.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <ProfileInput
                        label="Address Label"
                        icon={<FaHouse />}
                        value={
                          newAddress.label
                        }
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

                      <ProfileInput
                        label="Country"
                        icon={
                          <FaLocationDot />
                        }
                        value={
                          newAddress.country
                        }
                        onChange={(value) =>
                          setNewAddress(
                            (current) => ({
                              ...current,
                              country: value,
                            }),
                          )
                        }
                        placeholder="Bangladesh"
                        required
                      />

                      <ProfileInput
                        label="Address Line 1"
                        icon={
                          <FaLocationDot />
                        }
                        value={
                          newAddress.line1
                        }
                        onChange={(value) =>
                          setNewAddress(
                            (current) => ({
                              ...current,
                              line1: value,
                            }),
                          )
                        }
                        placeholder="House, road or area"
                        required
                        className="sm:col-span-2"
                      />

                      <ProfileInput
                        label="Address Line 2"
                        icon={
                          <FaLocationDot />
                        }
                        value={
                          newAddress.line2
                        }
                        onChange={(value) =>
                          setNewAddress(
                            (current) => ({
                              ...current,
                              line2: value,
                            }),
                          )
                        }
                        placeholder="Apartment, floor or landmark"
                        className="sm:col-span-2"
                      />

                      <ProfileInput
                        label="City"
                        icon={
                          <FaLocationDot />
                        }
                        value={
                          newAddress.city
                        }
                        onChange={(value) =>
                          setNewAddress(
                            (current) => ({
                              ...current,
                              city: value,
                            }),
                          )
                        }
                        placeholder="Chattogram"
                        required
                      />

                      <ProfileInput
                        label="Postal Code"
                        icon={
                          <FaLocationDot />
                        }
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
                        placeholder="4000"
                        required
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
                        Set as default delivery
                        address
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#F59E0B] to-orange-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingAddress ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Saving Address...
                        </>
                      ) : (
                        <>
                          <FaCheck />
                          Save Address
                        </>
                      )}
                    </button>
                  </form>
                )}

                {addresses.length === 0 ? (
                  <EmptyAddresses
                    onAdd={() =>
                      setShowAddressForm(true)
                    }
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map(
                      (address) => (
                        <AddressCard
                          key={address.id}
                          address={address}
                        />
                      ),
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right profile visual */}
          <aside className="space-y-6 lg:sticky lg:top-28">
            <section className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-[#121358]/15">
              <div className="relative h-72 overflow-hidden bg-gradient-to-br from-[#121358] via-[#292c82] to-[#0b0c42]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />

                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#F59E0B]/25 blur-3xl" />

                {!imageFailed ? (
                  <img
                    src={ADMIN_IMAGE}
                    alt="ShopSphere administrator"
                    className="relative z-10 h-full w-full object-cover object-center"
                    onError={() =>
                      setImageFailed(true)
                    }
                  />
                ) : (
                  <div className="relative z-10 flex h-full flex-col items-center justify-center text-white">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-[#F59E0B] bg-white/10 text-5xl text-[#F59E0B] shadow-2xl backdrop-blur-sm">
                      {isAdmin ? (
                        <FaUserShield />
                      ) : (
                        <FaUser />
                      )}
                    </div>

                    <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-white/55">
                      ShopSphere Account
                    </p>
                  </div>
                )}

                <span className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#121358]/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md">
                  <FaShieldHalved className="text-[#F59E0B]" />
                  Verified Account
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F59E0B]">
                      {isAdmin
                        ? "Administrator"
                        : "ShopSphere Member"}
                    </p>

                    <h2 className="mt-2 truncate text-2xl font-black text-[#121358]">
                      {user.name}
                    </h2>

                    <p className="mt-1 truncate text-sm text-slate-500">
                      {user.email}
                    </p>
                  </div>

                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#121358] text-[#F59E0B]">
                    <FaPenToSquare />
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <VisualStat
                    label="Role"
                    value={
                      isAdmin
                        ? "Admin"
                        : "Customer"
                    }
                  />

                  <VisualStat
                    label="Addresses"
                    value={String(
                      addresses.length,
                    )}
                  />
                </div>

                <div className="mt-5 rounded-2xl border border-[#121358]/10 bg-[#f8f8ff] p-4">
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#121358]">
                    <FaLocationDot className="text-[#F59E0B]" />
                    Default Delivery
                  </p>

                  {defaultAddress ? (
                    <>
                      <p className="mt-3 text-sm font-bold text-slate-700">
                        {defaultAddress.label ||
                          "Default Address"}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {defaultAddress.line1}
                        {defaultAddress.line2
                          ? `, ${defaultAddress.line2}`
                          : ""}
                        <br />
                        {defaultAddress.city},{" "}
                        {
                          defaultAddress.postal_code
                        }
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      No default delivery address
                      has been selected.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#121358]/10 bg-gradient-to-br from-[#121358] to-[#292c82] p-6 text-white shadow-xl">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl text-[#F59E0B]">
                  <FaLock />
                </span>

                <div>
                  <h3 className="font-black">
                    Account Security
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/65">
                    Keep your contact information
                    accurate so order and account
                    notifications reach you
                    correctly.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

type SectionHeaderProps = {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

function SectionHeader({
  icon,
  eyebrow,
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-white to-[#f8f8ff] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#121358] text-xl text-[#F59E0B] shadow-lg">
          {icon}
        </span>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F59E0B]">
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

type ProfileInputProps = {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

function ProfileInput({
  label,
  icon,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  className = "",
}: ProfileInputProps) {
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

      <span className="relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#121358]/45">
          {icon}
        </span>

        <input
          type={type}
          value={value}
          required={required}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#F59E0B] focus:bg-white focus:ring-4 focus:ring-[#F59E0B]/10"
        />
      </span>
    </label>
  );
}

type AddressCardProps = {
  address: Address;
};

function AddressCard({
  address,
}: AddressCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border-2 border-transparent bg-[#f8f8ff] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#F59E0B]/40 hover:bg-white hover:shadow-lg">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#F59E0B]/10 blur-2xl" />

      <div className="relative flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#121358] text-[#F59E0B]">
          <FaHouse />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black text-[#121358]">
              {address.label ||
                "Address"}
            </h3>

            {address.is_default && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-700">
                <FaCheck size={8} />
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
        </div>
      </div>

      <div className="relative mt-5 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-[10px] font-semibold text-slate-400">
        <FaLock />
        Address protected by your account
      </div>
    </article>
  );
}

type EmptyAddressesProps = {
  onAdd: () => void;
};

function EmptyAddresses({
  onAdd,
}: EmptyAddressesProps) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-[#121358]/15 bg-[#f8f8ff] px-6 py-10 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#121358]/10 text-2xl text-[#121358]">
        <FaLocationDot />
      </span>

      <h3 className="mt-5 text-xl font-black text-[#121358]">
        No saved addresses
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Add a delivery address to make future
        checkout faster and easier.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#F59E0B] px-5 py-3 text-sm font-black text-white transition hover:bg-orange-500"
      >
        <FaPlus />
        Add Address
      </button>
    </div>
  );
}

type ProfileHeroStatProps = {
  label: string;
  value: string;
};

function ProfileHeroStat({
  label,
  value,
}: ProfileHeroStatProps) {
  return (
    <div className="min-w-28 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
      <p className="text-[9px] font-black uppercase tracking-wider text-white/45">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-[#F59E0B]">
        {value}
      </p>
    </div>
  );
}

type VisualStatProps = {
  label: string;
  value: string;
};

function VisualStat({
  label,
  value,
}: VisualStatProps) {
  return (
    <div className="rounded-xl border border-[#121358]/10 bg-[#f8f8ff] p-3 text-center">
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-[#121358]">
        {value}
      </p>
    </div>
  );
}