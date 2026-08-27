"use client";

import {
  FormEvent,
  ReactNode,
  useEffect,
  useState,
} from "react";

import {
  FaBuilding,
  FaCheck,
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaLocationDot,
  FaPhone,
  FaStore,
  FaWhatsapp,
} from "react-icons/fa6";

import { PageLoader } from "@/components/ui/Spinner";

import {
  ApiError,
  businessSettingsApi,
  type BusinessSettingsPayload,
} from "@/lib/api";

const INITIAL_FORM: BusinessSettingsPayload = {
  business_name: "ShopSphere",
  business_email: "",
  business_phone: "",
  whatsapp_country_code: "880",
  whatsapp_number: "",
  business_address: "",
  currency: "BDT",
  facebook_url: "",
  instagram_url: "",
};

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error
  ) {
    const message = (
      error as {
        message?: unknown;
      }
    ).message;

    if (typeof message === "string") {
      return message;
    }
  }

  return "Something went wrong. Please try again.";
}

export default function BusinessSettingsPage() {
  const [form, setForm] =
    useState<BusinessSettingsPayload>(
      INITIAL_FORM,
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        setLoading(true);
        setError("");

        const settings =
          await businessSettingsApi.get();

        if (!active) {
          return;
        }

        setForm({
          business_name:
            settings.business_name ||
            "ShopSphere",

          business_email:
            settings.business_email ||
            "",

          business_phone:
            settings.business_phone ||
            "",

          whatsapp_country_code:
            settings.whatsapp_country_code ||
            "880",

          whatsapp_number:
            settings.whatsapp_number ||
            "",

          business_address:
            settings.business_address ||
            "",

          currency:
            settings.currency ||
            "BDT",

          facebook_url:
            settings.facebook_url ||
            "",

          instagram_url:
            settings.instagram_url ||
            "",
        });
      } catch (error) {
        console.error(
          "Unable to load business settings:",
          error,
        );

        if (active) {
          setError(
            getErrorMessage(error),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      active = false;
    };
  }, []);

  function updateField<
    K extends keyof BusinessSettingsPayload,
  >(
    field: K,
    value: BusinessSettingsPayload[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.business_name.trim()) {
      setError(
        "Business name is required.",
      );
      return;
    }

    if (
      !form.whatsapp_country_code.trim()
    ) {
      setError(
        "WhatsApp country code is required.",
      );
      return;
    }

    if (
      !form.whatsapp_number.trim()
    ) {
      setError(
        "WhatsApp number is required.",
      );
      return;
    }

    if (!form.currency.trim()) {
      setError(
        "Currency is required.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response =
        await businessSettingsApi.update(
          {
            business_name:
              form.business_name.trim(),

            business_email:
              form.business_email
                ?.trim() || null,

            business_phone:
              form.business_phone
                ?.trim() || null,

            whatsapp_country_code:
              form.whatsapp_country_code
                .replace(/\D/g, ""),

            whatsapp_number:
              form.whatsapp_number.trim(),

            business_address:
              form.business_address
                ?.trim() || null,

            currency:
              form.currency
                .trim()
                .toUpperCase(),

            facebook_url:
              form.facebook_url
                ?.trim() || null,

            instagram_url:
              form.instagram_url
                ?.trim() || null,
          },
        );

      setForm({
        business_name:
          response.data.business_name,

        business_email:
          response.data.business_email ||
          "",

        business_phone:
          response.data.business_phone ||
          "",

        whatsapp_country_code:
          response.data
            .whatsapp_country_code,

        whatsapp_number:
          response.data.whatsapp_number ||
          "",

        business_address:
          response.data.business_address ||
          "",

        currency:
          response.data.currency,

        facebook_url:
          response.data.facebook_url ||
          "",

        instagram_url:
          response.data.instagram_url ||
          "",
      });

      setSuccess(
        "Business settings saved successfully.",
      );
    } catch (error) {
      console.error(
        "Unable to save business settings:",
        error,
      );

      setError(
        getErrorMessage(error),
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <PageLoader />;
  }

  const cleanCountryCode =
    form.whatsapp_country_code.replace(
      /\D/g,
      "",
    );

  const cleanWhatsAppNumber =
    form.whatsapp_number
      .replace(/\D/g, "")
      .replace(/^0+/, "");

  const previewWhatsApp =
    cleanCountryCode &&
    cleanWhatsAppNumber
      ? `${cleanCountryCode}${cleanWhatsAppNumber}`
      : "";

  return (
    <main className="min-h-screen bg-[#f4f5ff] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#121358] to-[#292c82] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F59E0B] text-2xl text-white shadow-lg">
              <FaStore />
            </span>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F59E0B]">
                Store configuration
              </p>

              <h1 className="mt-2 text-3xl font-black">
                Business Settings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                Manage business information,
                contact details, WhatsApp
                ordering and social media
                information.
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
            <FaCheck />
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
        >
          <div className="space-y-6">
            <SettingsSection
              icon={<FaBuilding />}
              title="Business Information"
              description="General information about your store."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <SettingsInput
                  label="Business Name"
                  required
                  value={
                    form.business_name
                  }
                  onChange={(value) =>
                    updateField(
                      "business_name",
                      value,
                    )
                  }
                  placeholder="ShopSphere"
                />

                <SettingsInput
                  label="Currency"
                  required
                  value={form.currency}
                  onChange={(value) =>
                    updateField(
                      "currency",
                      value,
                    )
                  }
                  placeholder="BDT"
                />

                <SettingsInput
                  label="Business Email"
                  type="email"
                  value={
                    form.business_email ||
                    ""
                  }
                  onChange={(value) =>
                    updateField(
                      "business_email",
                      value,
                    )
                  }
                  placeholder="business@example.com"
                />

                <SettingsInput
                  label="Business Phone"
                  type="tel"
                  value={
                    form.business_phone ||
                    ""
                  }
                  onChange={(value) =>
                    updateField(
                      "business_phone",
                      value,
                    )
                  }
                  placeholder="01306712087"
                />
              </div>

              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-bold text-[#121358]">
                  Business Address
                </span>

                <textarea
                  rows={4}
                  value={
                    form.business_address ||
                    ""
                  }
                  onChange={(event) =>
                    updateField(
                      "business_address",
                      event.target.value,
                    )
                  }
                  placeholder="Enter business address..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#F59E0B] focus:bg-white focus:ring-4 focus:ring-[#F59E0B]/10"
                />
              </label>
            </SettingsSection>

            <SettingsSection
              icon={<FaWhatsapp />}
              title="WhatsApp Ordering"
              description="Customer WhatsApp orders will be sent to this business number."
            >
              <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                <SettingsInput
                  label="Country Code"
                  required
                  value={
                    form.whatsapp_country_code
                  }
                  onChange={(value) =>
                    updateField(
                      "whatsapp_country_code",
                      value.replace(
                        /\D/g,
                        "",
                      ),
                    )
                  }
                  placeholder="880"
                />

                <SettingsInput
                  label="WhatsApp Number"
                  required
                  type="tel"
                  value={
                    form.whatsapp_number
                  }
                  onChange={(value) =>
                    updateField(
                      "whatsapp_number",
                      value,
                    )
                  }
                  placeholder="01306712087"
                />
              </div>

              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  WhatsApp Destination Preview
                </p>

                <p className="mt-2 font-black text-emerald-700">
                  {previewWhatsApp
                    ? `+${previewWhatsApp}`
                    : "Not configured"}
                </p>
              </div>
            </SettingsSection>

            <SettingsSection
              icon={<FaLocationDot />}
              title="Social Media"
              description="Optional social media links for your business."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <SettingsInput
                  label="Facebook URL"
                  type="url"
                  value={
                    form.facebook_url ||
                    ""
                  }
                  onChange={(value) =>
                    updateField(
                      "facebook_url",
                      value,
                    )
                  }
                  placeholder="https://facebook.com/..."
                />

                <SettingsInput
                  label="Instagram URL"
                  type="url"
                  value={
                    form.instagram_url ||
                    ""
                  }
                  onChange={(value) =>
                    updateField(
                      "instagram_url",
                      value,
                    )
                  }
                  placeholder="https://instagram.com/..."
                />
              </div>
            </SettingsSection>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-[#121358]/5">
              <h2 className="text-xl font-black text-[#121358]">
                Store Preview
              </h2>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Preview the business
                information currently entered.
              </p>

              <div className="mt-6 space-y-5">
                <PreviewRow
                  icon={<FaStore />}
                  label="Business"
                  value={
                    form.business_name ||
                    "Not set"
                  }
                />

                <PreviewRow
                  icon={<FaWhatsapp />}
                  label="WhatsApp"
                  value={
                    previewWhatsApp
                      ? `+${previewWhatsApp}`
                      : "Not set"
                  }
                />

                <PreviewRow
                  icon={<FaEnvelope />}
                  label="Email"
                  value={
                    form.business_email ||
                    "Not set"
                  }
                />

                <PreviewRow
                  icon={<FaPhone />}
                  label="Phone"
                  value={
                    form.business_phone ||
                    "Not set"
                  }
                />

                <PreviewRow
                  icon={<FaFacebook />}
                  label="Facebook"
                  value={
                    form.facebook_url
                      ? "Configured"
                      : "Not set"
                  }
                />

                <PreviewRow
                  icon={<FaInstagram />}
                  label="Instagram"
                  value={
                    form.instagram_url
                      ? "Configured"
                      : "Not set"
                  }
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-orange-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <FaCheck />
                )}

                {saving
                  ? "Saving..."
                  : "Save Business Settings"}
              </button>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}

type SettingsSectionProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

function SettingsSection({
  icon,
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-[#121358]/5">
      <div className="flex items-start gap-4 border-b border-slate-100 p-5 sm:p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#121358] text-[#F59E0B]">
          {icon}
        </span>

        <div>
          <h2 className="text-lg font-black text-[#121358]">
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

type SettingsInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?:
    | "text"
    | "email"
    | "tel"
    | "url";
};

function SettingsInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}: SettingsInputProps) {
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

type PreviewRowProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

function PreviewRow({
  icon,
  label,
  value,
}: PreviewRowProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4f5ff] text-[#121358]">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-bold text-[#121358]">
          {value}
        </p>
      </div>
    </div>
  );
}