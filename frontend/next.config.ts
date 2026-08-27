import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
     * Needed for Laravel images during local development.
     */
    dangerouslyAllowLocalIP: true,

    remotePatterns: [
      // Local Laravel using localhost
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },

      // Local Laravel using 127.0.0.1
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },

      // Production Laravel backend on Render
      {
        protocol: "https",
        hostname: "shopsphere-backend-bsma.onrender.com",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;