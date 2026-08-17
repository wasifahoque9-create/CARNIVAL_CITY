import Image from "next/image";
import { Target, ShieldCheck, TrendingUp, Award } from "lucide-react";
import Link from "next/link";
export default function AboutPage() {
  return (
    <div className="bg-white text-gray-800">

      {/* HERO */}
      <section className="relative bg-slate-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <span className="inline-block px-4 py-2 bg-yellow-400 text-black rounded-full text-sm font-semibold mb-6">
            Welcome to ShopSphere
          </span>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            About ShopSphere
          </h1>

          <p className="mt-6 text-gray-300 max-w-3xl mx-auto text-lg">
            Your trusted destination for gadgets, repairs, and premium
            technology solutions designed to keep you connected.
          </p>
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

          {/* TEXT */}
          <div>
            <span className="text-yellow-500 uppercase tracking-widest text-sm font-semibold">
              Our Story
            </span>

            <h2 className="text-4xl font-bold mt-4 mb-6">
              Innovation Meets Reliability
            </h2>

            <p className="text-gray-600 leading-relaxed text-lg mb-6">
              ShopSphere started with a simple mission — making technology
              services and gadget repairs accessible, reliable, and affordable
              for everyone.
            </p>

            <p className="text-gray-600 leading-relaxed text-lg">
              We believe every device deserves expert care. From repairs to
              premium gadgets, our goal is to provide exceptional service and
              lasting value for every customer.
            </p>
          </div>

          {/* IMAGE */}
          <div className="relative group">

            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-3xl blur-2xl"></div>

            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">

              <div className="relative w-full min-h-[350px] md:min-h-[500px]">

                <Image
                  src="/about.png"
                  alt="About ShopSphere"
                  fill
                  priority
                  className="
                    object-contain
                    p-6
                    transition-transform
                    duration-700
                    group-hover:scale-105
                  "
                />

              </div>

              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm px-5 py-3 rounded-xl shadow-lg">
                <p className="font-semibold text-slate-900">
                  10+ Years Experience
                </p>

                <p className="text-sm text-gray-500">
                  Trusted by thousands
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* MISSION */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <span className="text-yellow-500 uppercase tracking-widest text-sm font-semibold">
            What Drives Us
          </span>

          <h2 className="text-4xl font-bold mt-4 mb-14">
            Our Mission
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition">
              <Target className="mx-auto text-yellow-500" size={40} />

              <h3 className="font-semibold text-xl mt-5">
                Quality Service
              </h3>

              <p className="text-gray-600 mt-3">
                Fast, reliable, and professional repair services for all your devices.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition">
              <ShieldCheck className="mx-auto text-yellow-500" size={40} />

              <h3 className="font-semibold text-xl mt-5">
                Trust & Security
              </h3>

              <p className="text-gray-600 mt-3">
                Your gadgets are handled with complete care and transparency.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition">
              <TrendingUp className="mx-auto text-yellow-500" size={40} />

              <h3 className="font-semibold text-xl mt-5">
                Continuous Growth
              </h3>

              <p className="text-gray-600 mt-3">
                Constant innovation to improve our services and customer experience.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* STATS */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">

          <div className="bg-slate-900 rounded-3xl p-10 md:p-16">

            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center text-white">

              <div>
                <h3 className="text-4xl font-bold text-yellow-400">
                  10K+
                </h3>
                <p className="mt-2 text-gray-300">
                  Happy Customers
                </p>
              </div>

              <div>
                <h3 className="text-4xl font-bold text-yellow-400">
                  25K+
                </h3>
                <p className="mt-2 text-gray-300">
                  Devices Repaired
                </p>
              </div>

              <div>
                <h3 className="text-4xl font-bold text-yellow-400">
                  50+
                </h3>
                <p className="mt-2 text-gray-300">
                  Experts
                </p>
              </div>

              <div>
                <h3 className="text-4xl font-bold text-yellow-400">
                  4.9★
                </h3>
                <p className="mt-2 text-gray-300">
                  Customer Rating
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <Award className="mx-auto text-yellow-500 mb-4" size={50} />

          <h2 className="text-4xl font-bold mb-6">
            Why Customers Choose Us
          </h2>

          <p className="max-w-3xl mx-auto text-gray-600 text-lg">
            Combining technical expertise, genuine customer care, and premium
            service standards, ShopSphere has become a trusted technology
            partner for thousands of customers.
          </p>

        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 text-white py-24 text-center">

        <h2 className="text-4xl font-bold">
          Need Help With Your Device?
        </h2>

        <p className="text-gray-300 mt-4 text-lg">
          Contact our experts for fast, reliable, and professional support.
        </p>



<Link
  href="/contact"
  className="mt-8 inline-block bg-yellow-400 text-black px-8 py-4 rounded-xl font-semibold hover:bg-yellow-300 transition"
>
  Contact Us
</Link>
      </section>

    </div>
  );
}