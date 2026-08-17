"use client";

import { FormEvent } from "react";

export default function Contact() {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // TODO: connect to backend later (Laravel API or email service)
    alert("Message sent successfully (frontend only)");
  };

  return (
    <section className="min-h-screen bg-[#121358] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">

        {/* LEFT SIDE */}
        <div>
          <p className="text-[#F59E0B] uppercase tracking-widest mb-3">
            Get In Touch
          </p>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            We&apos;d Love To Hear From You
          </h1>

          <p className="text-gray-300 mb-10">
            Have questions about our products or services?
            Send us a message and our team will get back to you soon.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-[#F59E0B] font-semibold text-lg">
                Address
              </h3>
              <p className="text-white">Chattogram, Bangladesh</p>
            </div>

            <div>
              <h3 className="text-[#F59E0B] font-semibold text-lg">
                Email
              </h3>
              <p className="text-white">support@ecommerce.com</p>
            </div>

            <div>
              <h3 className="text-[#F59E0B] font-semibold text-lg">
                Phone
              </h3>
              <p className="text-white">+880 1234-567890</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="bg-white rounded-3xl p-8 shadow-xl w-full">

          <h2 className="text-3xl font-bold text-[#121358] mb-6">
            Send Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            <input
              type="text"
              placeholder="Full Name"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#121358]"
              required
            />

            <input
              type="email"
              placeholder="Email Address"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#121358]"
              required
            />

            <input
              type="text"
              placeholder="Subject"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#121358]"
            />

            <textarea
              rows={5}
              placeholder="Write your message..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#121358]"
              required
            />

            <button
              type="submit"
              className="w-full bg-[#F59E0B] hover:bg-[#e69508] text-white py-3 rounded-full font-semibold transition"
            >
              Send Message
            </button>

          </form>
        </div>

      </div>
    </section>
  );
}