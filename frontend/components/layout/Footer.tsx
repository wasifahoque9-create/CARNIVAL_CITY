"use client";

import Link from "next/link";
import { Mail, ArrowUp } from "lucide-react";
import {
  FaFacebookF,
  FaXTwitter,
  FaDiscord,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa6";

export default function Footer() {
  const socials = [
    { Icon: FaFacebookF, href: "#", label: "Facebook" },
    { Icon: FaXTwitter, href: "#", label: "X" },
    { Icon: FaDiscord, href: "#", label: "Discord" },
    { Icon: FaTiktok, href: "#", label: "TikTok" },
    { Icon: FaYoutube, href: "#", label: "YouTube" },
  ];
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
  <>
    <footer className="relative overflow-hidden bg-slate-950 text-gray-300">

        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-yellow-400/10 blur-[140px] rounded-full"></div>

        {/* Newsletter */}
        <div className="relative max-w-7xl mx-auto px-6 pt-16">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-8 md:p-12 shadow-2xl">

            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

              <div>
                <p className="uppercase text-black/70 text-sm font-semibold tracking-widest">
                  Stay Updated
                </p>

                <h2 className="text-3xl font-bold text-black mt-2">
                  Get Deals, Tips & Product Updates
                </h2>
              </div>

              <form
                onSubmit={(event) => event.preventDefault()}
                className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto"
              >

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 pr-4 py-3 rounded-xl outline-none min-w-[280px] text-black"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-black text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition"
                >
                  Subscribe
                </button>

              </form>

            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="relative max-w-7xl mx-auto px-6 py-20">

          {/* Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
              ⚡ Same Day Repairs
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
              🛡️ 6 Month Warranty
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
              🔒 Secure Payments
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

            {/* Brand */}
            <div>

              <h2 className="text-3xl font-extrabold text-white">
                Shop<span className="text-yellow-400">Sphere</span>
              </h2>

              <p className="text-xs tracking-[0.25em] uppercase text-gray-500 mt-2">
                Gadgets • Repairs • Innovation
              </p>

              <p className="mt-5 text-gray-400 text-sm leading-relaxed">
                Your trusted destination for gadget repairs,
                premium electronics and expert support.
              </p>

              <div className="flex gap-3 mt-6">

                {socials.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="
      h-10 w-10
      rounded-xl
      border border-slate-700
      bg-slate-900
      flex items-center justify-center
      hover:bg-yellow-400
      hover:text-black
      hover:-translate-y-1
      transition-all
    "
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>

            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-5">
                Company
              </h3>

              <ul className="space-y-3 text-sm">

                <li>
                  <Link href="/" className="hover:text-yellow-400">
                    Home
                  </Link>
                </li>

                <li>
                  <Link href="/about" className="hover:text-yellow-400">
                    About
                  </Link>
                </li>

                <li>
                  <Link href="/contact" className="hover:text-yellow-400">
                    Contact
                  </Link>
                </li>

              </ul>
            </div>

            {/* Services */}
            <div>

              <h3 className="text-white font-semibold mb-5">
                Services
              </h3>

              <ul className="space-y-3 text-sm">
                <li>Phone Repair</li>
                <li>Laptop Repair</li>
                <li>Tablet Repair</li>
                <li>Software Fix</li>
                <li>Game Console Repair</li>
              </ul>

            </div>

            {/* Contact Card */}
            <div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                <h3 className="text-white font-semibold">
                  Need Help?
                </h3>

                <p className="text-sm text-gray-400 mt-3">
                  Our support team is available 24/7.
                </p>

                <p className="text-sm mt-4">
                  contact@shopsphere.com
                </p>

                <Link
                  href="/contact"
                  className="block w-full mt-5 bg-yellow-400 text-black py-3 rounded-xl font-semibold text-center hover:bg-yellow-300 transition"
                >
                  Contact Support
                </Link>

              </div>

            </div>

          </div>

          <div className="border-t border-slate-800 mt-16 pt-8">

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">

              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} ShopSphere.
                All rights reserved.
              </p>

              <div className="flex gap-5 text-sm">
                <Link href="/privacy">Privacy Policy</Link>
                <Link href="/terms">Terms & Conditions</Link>
              </div>

            </div>

          </div>

        </div>

          </footer>

    {/* Back To Top Button */}
    <button
      type="button"
      aria-label="Back to top"
      onClick={scrollToTop}
      className="
        fixed bottom-6 right-6
        z-50
        flex h-12 w-12
        items-center justify-center
        rounded-full
        bg-yellow-400
        text-black
        shadow-xl
        transition
        hover:scale-110
      "
    >
      <ArrowUp size={18} />
    </button>
  </>
);
}