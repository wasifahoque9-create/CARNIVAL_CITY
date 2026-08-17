// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     dangerouslyAllowLocalIP: true,
//     remotePatterns: [
//       {
//         protocol: "http",
//         hostname: "localhost",
//         port: "8000",
//         pathname: "/storage/**",
//       },
//     ],
//   },
// };

// export default nextConfig;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
     * Required for local Laravel images in Next.js 16.
     * Use this only for local development.
     */
    dangerouslyAllowLocalIP: true,

    remotePatterns: [
      {
        protocol: "http",
        hostname: "shopsphere-backend-bsma.onrender.com",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;