"use client";


import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import ProductsByCategory from "@/components/products/ProductsByCategory";
import { PageLoader } from "@/components/ui/Spinner";
import { bannerApi, catalogApi, getBannerImage } from "@/lib/api";
import type { Category } from "@/types";

type Banner = {
  id: number | string;
  tag?: string | null;
  title: string;
  highlight?: string | null;
  description?: string | null;
  price?: number | string | null;
  discount_text?: string | null;
  fallback_emoji?: string | null;
  cta_link?: string | null;
  cta_text?: string | null;
  secondary_cta_link?: string | null;
  secondary_cta_text?: string | null;
  image?: string | null;
  image_path?: string | null;
};

const categoryIcons: Record<string, string> = {
  laptop: "💻",
  laptops: "💻",
  pc: "🖥️",
  desktop: "🖥️",
  desktops: "🖥️",
  mobile: "📱",
  mobiles: "📱",
  phone: "📱",
  smartphone: "📱",
  earbuds: "🎧",
  headphone: "🎧",
  headphones: "🎧",
  accessory: "🔌",
  accessories: "🔌",
  watch: "⌚",
  smartwatch: "⌚",
  tablet: "📟",
  camera: "📷",
};

type CategoryWithImage = Category & {
  image_url?: string | null;
};

type PromoImageProps = {
  src?: string | null;
  alt: string;
  fallback: string;
  className?: string;
  priority?: boolean;
};

function PromoImage({
  src,
  alt,
  fallback,
  className = "",
  priority = false,
}: PromoImageProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!src || imageFailed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="select-none text-7xl drop-shadow-xl sm:text-8xl">
          {fallback}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 1024px) 100vw, 50vw"
      className={`object-contain ${className}`}
      onError={() => setImageFailed(true)}
    />
  );
}

// Full-cover image used only by the large hero banner.
// Unlike PromoImage, this intentionally uses object-cover so the uploaded
// banner fills the complete hero section.
function HeroBannerImage({
  src,
  alt,
  fallback,
  priority = false,
}: PromoImageProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!src || imageFailed) {
    return (
      <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-[#121358] via-[#242675] to-[#4b4eb5]">
        <div className="flex h-full w-full items-center justify-center">
          <span className="select-none text-8xl opacity-30 drop-shadow-xl sm:text-9xl">
            {fallback}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 1024px) 100vw, 70vw"
      className="object-cover object-center"
      onError={() => setImageFailed(true)}
    />
  );
}
// ---------------------------------------------------------------------------
// Hero slide shape used for rendering. This is filled either from the admin
// -managed Banner API, or — if no banners exist yet — from the static
// defaults below, so the homepage never looks empty on a fresh install.
// ---------------------------------------------------------------------------
type HeroSlideData = {
  key: string;
  tag: string;
  title: string;
  highlight?: string | null;
  description: string;
  price?: string | null;
  discount?: string | null;
  image?: string | null;
  fallback: string;
  ctaHref: string;
  ctaText: string;
  secondaryCtaHref: string;
  secondaryCtaText: string;
};

function renderHeroTitle(title: string, highlight?: string | null) {
  if (!highlight) {
    return title;
  }

  const index = title.indexOf(highlight);

  if (index === -1) {
    return title;
  }

  return (
    <>
      {title.slice(0, index)}
      <span className="text-[#F59E0B]">{highlight}</span>
      {title.slice(index + highlight.length)}
    </>
  );
}

function bannerToSlide(banner: Banner): HeroSlideData {
  return {
    key: `banner-${banner.id}`,
    tag: banner.tag || "Featured",
    title: banner.title,
    highlight: banner.highlight,
    description: banner.description || "",
    price:
      banner.price !== null && banner.price !== undefined
        ? String(banner.price)
        : null,
    discount: banner.discount_text,
    image: getBannerImage(banner),
    fallback: banner.fallback_emoji || "🛍️",
    ctaHref: banner.cta_link || "#shop-by-category",
    ctaText: banner.cta_text || "Shop Now",
    secondaryCtaHref: banner.secondary_cta_link || "/products",
    secondaryCtaText: banner.secondary_cta_text || "Browse All",
  };
}

// Used only until the admin adds real banners (or if the banners API fails).
const defaultHeroSlides: HeroSlideData[] = [
  {
    key: "default-1",
    tag: "Featured Technology",
    title: "Upgrade Your World With Smarter Gadgets",
    highlight: "Smarter Gadgets",
    description:
      "Discover premium laptops, smartphones, tablets and accessories selected to make everyday life easier.",
    price: "236",
    discount: "Save up to 25%",
    image: "/mobile.png",
    fallback: "💻",
    ctaHref: "#shop-by-category",
    ctaText: "Shop Now",
    secondaryCtaHref: "/products",
    secondaryCtaText: "Browse All",
  },
  {
    key: "default-2",
    tag: "Hot Deal",
    title: "Power Through Your Day With Pro Laptops",
    highlight: "Pro Laptops",
    description:
      "High-performance laptops built for work, gaming, and everything in between.",
    price: "412",
    discount: "Save up to 20%",
    image: "/laptp2.png",
    fallback: "💻",
    ctaHref: "#shop-by-category",
    ctaText: "Shop Now",
    secondaryCtaHref: "/products",
    secondaryCtaText: "Browse All",
  },
  {
    key: "default-3",
    tag: "Just Dropped",
    title: "Capture Every Moment With Smart Cameras",
    highlight: "Smart Cameras",
    description: "Power, performance, and productivity in one setup",
    price: "189",
    discount: "Save up to 30%",
    image: "/sle1.png",
    fallback: "📷",
    ctaHref: "#shop-by-category",
    ctaText: "Shop Now",
    secondaryCtaHref: "/products",
    secondaryCtaText: "Browse All",
  },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [heroSlides, setHeroSlides] = useState<HeroSlideData[]>(defaultHeroSlides);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [categorySwiper, setCategorySwiper] = useState<SwiperType | null>(null);
  const [isCategoryStart, setIsCategoryStart] = useState(true);
  const [isCategoryEnd, setIsCategoryEnd] = useState(false);

  useEffect(() => {
    let pageIsActive = true;

    async function loadCategories() {
      try {
        setLoading(true);
        setError("");

        const categoryData = await catalogApi.getCategories();

        if (pageIsActive) {
          setCategories(categoryData);
        }
      } catch (error) {
        console.error("Unable to load categories:", error);

        if (pageIsActive) {
          setError(
            "Unable to load categories. Make sure the Laravel API is running.",
          );
        }
      } finally {
        if (pageIsActive) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      pageIsActive = false;
    };
  }, []);

  // Loaded independently from categories: the hero already has sensible
  // static defaults, so there's no need to block the whole page on this.
  useEffect(() => {
    let pageIsActive = true;

    async function loadBanners() {
      try {
        const banners = await bannerApi.getActive();

        if (pageIsActive && Array.isArray(banners) && banners.length > 0) {
          setHeroSlides(banners.map(bannerToSlide));
        }
      } catch (error) {
        console.error("Unable to load banners:", error);
        // Falls back to defaultHeroSlides, already set as initial state.
      }
    }

    loadBanners();

    return () => {
      pageIsActive = false;
    };
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Promotional information bar */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-2.5 text-xs font-medium text-slate-600 sm:px-6 lg:px-8">
          <span className="flex items-center gap-2">
            <span className="text-base">🚚</span>
            Free delivery on selected orders
          </span>

          <span className="hidden h-4 w-px bg-slate-300 sm:block" />

          <span className="flex items-center gap-2">
            <span className="text-base">🔥</span>
            New deals added every week
          </span>

          <span className="hidden h-4 w-px bg-slate-300 sm:block" />

          <span className="flex items-center gap-2">
            <span className="text-base">🛡️</span>
            Secure and trusted shopping
          </span>
        </div>
      </section>

      {/* Hero promotional section */}
      <section className="px-4 pb-5 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 lg:grid-cols-12 lg:items-stretch">
          {/* Main large promotional banner — driven by the admin-managed Banner API */}
          <article className="relative h-[560px] overflow-hidden rounded-3xl bg-[#121358] text-white shadow-xl sm:h-[580px] lg:col-span-8 lg:h-[620px]">
            <Swiper
              modules={[Autoplay]}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              loop={heroSlides.length > 1}
              onSlideChange={(swiper) => setActiveHeroSlide(swiper.realIndex)}
              className="hero-swiper relative z-10 h-full w-full"
            >
              {heroSlides.map((slide, index) => (
                <SwiperSlide key={slide.key} className="!h-full">
                  <div className="relative h-full w-full overflow-hidden">
                    {/* Uploaded banner image fills the complete hero div */}
                    <div className="absolute inset-0 z-0 h-full w-full">
                      <HeroBannerImage
                        src={slide.image}
                        alt={`${slide.tag} promotion`}
                        fallback={slide.fallback}
                        priority={index === 0}
                      />
                    </div>

                    {/* Overlay keeps text readable */}
                    <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#080934]/95 via-[#121358]/72 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/35 via-transparent to-black/5 sm:hidden" />

                    {/* Slide content */}
                    <div className="relative z-20 flex h-full w-full items-center px-6 py-9 sm:px-10 sm:py-10 lg:px-12">
                      <div className="max-w-xl sm:max-w-[58%]">
                        {slide.tag && (
                          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur-sm">
                            <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                            {slide.tag}
                          </div>
                        )}

                        <h1 className="max-w-lg text-3xl font-black leading-tight text-white drop-shadow-md sm:text-4xl lg:text-5xl">
                          {renderHeroTitle(slide.title, slide.highlight)}
                        </h1>

                        {slide.description && (
                          <p className="mt-5 max-w-md text-sm leading-7 text-white/90 drop-shadow sm:text-base">
                            {slide.description}
                          </p>
                        )}

                        {(slide.price || slide.discount) && (
                          <div className="mt-6 flex flex-wrap items-end gap-3">
                            {slide.price && (
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-white/70">
                                  Starting from
                                </p>
                                <p className="mt-1 text-3xl font-black text-white">
                                  ${slide.price}
                                  <span className="text-base font-semibold text-white/70">.00</span>
                                </p>
                              </div>
                            )}

                            {slide.discount && (
                              <span className="mb-1 rounded-md bg-[#F59E0B] px-2.5 py-1 text-xs font-bold text-white">
                                {slide.discount}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mt-8 flex flex-wrap gap-3">
                          <Link
                            href={slide.ctaHref}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F59E0B] px-6 py-3 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-[#dc8908] hover:shadow-xl"
                          >
                            {slide.ctaText}
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="m9 18 6-6-6-6"
                              />
                            </svg>
                          </Link>

                          {slide.secondaryCtaText && (
                            <Link
                              href={slide.secondaryCtaHref}
                              className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-black/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition duration-300 hover:bg-white hover:text-[#121358]"
                            >
                              {slide.secondaryCtaText}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Slider dots */}
            {heroSlides.length > 1 && (
              <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 gap-2 sm:left-auto sm:right-8 sm:translate-x-0">
                {heroSlides.map((slide, index) => (
                  <span
                    key={slide.key}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeHeroSlide === index
                        ? "w-6 bg-[#F59E0B]"
                        : "w-2 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}

            <style jsx global>{`
              .hero-swiper,
              .hero-swiper .swiper-wrapper,
              .hero-swiper .swiper-slide {
                width: 100%;
                height: 100% !important;
              }
            `}</style>
          </article>

          {/* Right-side promotional banners */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-4 lg:h-[620px] lg:grid-cols-1 lg:grid-rows-2">
            {/* Smart watch banner */}
            <article className="group relative min-h-[250px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#ffd52a] to-[#f3a900] p-7 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl lg:h-full lg:min-h-0">
              <div className="relative z-20 max-w-[58%]">
                <span className="inline-block rounded-full bg-black/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#121358]">
                  Trending
                </span>

                <h2 className="mt-3 text-xl font-black leading-tight text-[#121358] sm:text-2xl">
                  Ultra Smart Watch
                </h2>

                <p className="mt-2 text-xs font-medium text-[#121358]/70">
                  Style, health and technology on your wrist.
                </p>

                <p className="mt-3 text-sm font-bold text-[#121358]">
                  Starting $19.00
                </p>

                <Link
                  href="/categories/Accessories"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wide text-[#121358] underline decoration-2 underline-offset-4"
                >
                  Shop now
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="absolute bottom-1 right-0 h-[88%] w-[45%] transition duration-500 group-hover:scale-105 group-hover:-rotate-3">
                <PromoImage
                  src="/watch1.png"
                  alt="Smart watch promotion"
                  fallback="⌚"
                  className="object-bottom"
                />
              </div>

              <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-white/30 blur-2xl" />
            </article>

            {/* Headphone banner */}
            <article className="group relative min-h-[250px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#7146d9] via-[#8b5de7] to-[#d167c7] p-7 text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl lg:h-full lg:min-h-0">
              <div className="relative z-20 max-w-[58%]">
                <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                  New Arrival
                </span>

                <h2 className="mt-3 text-xl font-black leading-tight sm:text-2xl">
                  Wireless Headphones
                </h2>

                <p className="mt-2 text-xs font-medium text-white/80">
                  Rich sound with comfortable all-day listening.
                </p>

                <p className="mt-3 text-sm font-bold text-white">
                  Starting $36.00
                </p>

                <Link
                  href="/categories/earbuds"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wide text-white underline decoration-2 underline-offset-4"
                >
                  Shop now
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="absolute bottom-0 right-0 h-[90%] w-[48%] transition duration-500 group-hover:scale-105 group-hover:rotate-3">
                <PromoImage
                  src="/earsbads.png"
                  alt="Wireless headphones promotion"
                  fallback="🎧"
                  className="object-bottom"
                />
              </div>

              <div className="pointer-events-none absolute -bottom-16 -right-10 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
            </article>
          </div>
        </div>
      </section>

      {/* Service benefits */}
      <section className="px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-4">
          <ServiceItem
            icon={<Truck size={22} strokeWidth={2.2} />}
            title="Fast Delivery"
            description="Quick delivery service"
          />

          <ServiceItem
            icon={<ShieldCheck size={22} strokeWidth={2.2} />}
            title="Secure Payment"
            description="Protected transactions"
          />

          <ServiceItem
            icon={<RotateCcw size={22} strokeWidth={2.2} />}
            title="Easy Returns"
            description="Simple return process"
          />
          <ServiceItem
            icon={<Headphones size={22} strokeWidth={2.2} />}
            title="Customer Support"
            description="We are ready to help"
          />
        </div>
      </section>

      {/* Shop by category */}
      <section id="shop-by-category" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F59E0B]">
              Find what you need
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#121358] sm:text-3xl">
              Shop by Category
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Explore our most popular technology categories.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#121358] transition hover:text-[#F59E0B]"
          >
            View all products
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {categories.length > 0 ? (
          <div className="relative">
            <Swiper
              modules={[Navigation]}
              spaceBetween={16}
              slidesPerView={2.2}
              onSwiper={setCategorySwiper}
              onSlideChange={(swiper) => {
                setIsCategoryStart(swiper.isBeginning);
                setIsCategoryEnd(swiper.isEnd);
              }}
              breakpoints={{
                480: { slidesPerView: 3.2 },
                768: { slidesPerView: 4.2 },
                1024: { slidesPerView: 6 },
              }}
              className="category-swiper !pb-1 !pl-1 !pr-1"
            >
              {categories.map((category) => {
                const categoryType = (
                  category.type ??
                  category.slug ??
                  ""
                ).toLowerCase();

                const categoryImageUrl = (category as CategoryWithImage).image_url
                  ? (category as CategoryWithImage).image_url!.replace(
                    "http://",
                    "https://",
                  )
                  : null;

                return (
                  <SwiperSlide key={category.id}>
                    <Link
                      href={`/categories/${category.slug}`}
                      className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#F59E0B]/50 hover:shadow-lg sm:p-6"
                    >
                      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#F59E0B]/10 transition duration-300 group-hover:scale-150" />

                      <div className="relative mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-[#121358]/5 transition duration-300 group-hover:bg-white group-hover:scale-105">
                        {categoryImageUrl ? (
                          <img
                            src={categoryImageUrl}
                            alt={category.name}
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <span className="text-3xl">
                            {categoryIcons[categoryType] ?? "📦"}
                          </span>
                        )}
                      </div>

                      <span className="relative mt-4 block text-sm font-bold text-slate-800 transition group-hover:text-[#121358]">
                        {category.name}
                      </span>

                      <span className="relative mt-2 inline-block text-xs font-semibold text-slate-400 transition group-hover:text-[#F59E0B]">
                        Explore products
                      </span>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* Left arrow */}
            <button
              type="button"
              aria-label="Previous categories"
              onClick={() => categorySwiper?.slidePrev()}
              disabled={isCategoryStart}
              className="absolute -left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#121358] shadow-md transition hover:bg-[#121358] hover:text-white disabled:pointer-events-none disabled:opacity-0 sm:-left-4 sm:flex"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>

            {/* Right arrow */}
            <button
              type="button"
              aria-label="Next categories"
              onClick={() => categorySwiper?.slideNext()}
              disabled={isCategoryEnd}
              className="absolute -right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#121358] shadow-md transition hover:bg-[#121358] hover:text-white disabled:pointer-events-none disabled:opacity-0 sm:-right-4 sm:flex"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          !error && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              No categories are currently available.
            </div>
          )
        )}
      </section>

      {/* Products grouped by category */}
      <section className="pb-14">
        <ProductsByCategory />
      </section>
    </main>
  );
}

type ServiceItemProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

function ServiceItem({ icon, title, description }: ServiceItemProps) {
  return (
    <div className="flex items-center gap-3 border-b border-r border-slate-200 p-4 transition hover:bg-slate-50 sm:p-5 lg:border-b-0">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F59E0B]/10 text-[#121358]">
    {icon}
</div>

      <div className="min-w-0">
        <h3 className="text-sm font-bold text-[#121358]">{title}</h3>

        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}
