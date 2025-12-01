/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  // disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
  fallbacks: {
    document: "/offline.html",
  },
});

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["react"],
    turbo: {
      loaders: {
        "*.json": ["json-loader"],
      },
    },
  },
};

module.exports = withPWA(nextConfig);
