import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep production verification builds away from the live dev server cache.
  // Running `next build` against `.next` while `next dev` is active corrupts
  // the dev asset manifest and leaves the page without CSS or JavaScript.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async redirects() {
    return [
      {
        source: "/images/graphics/birthday/:asset",
        destination: "/images/graphics/birthday/stickers/:asset",
        permanent: true,
      },
      {
        source: "/images/graphics/graduation-stickers/:asset",
        destination: "/images/graphics/graduation/stickers/:asset",
        permanent: true,
      },
      {
        source: "/images/graphics/graduation/:asset",
        destination: "/images/graphics/graduation/editorial/:asset",
        permanent: true,
      },
      {
        source: "/images/graphics/wedding-assets/:asset",
        destination: "/images/graphics/wedding/stickers/:asset",
        permanent: true,
      },
      {
        source: "/images/graphics/wedding-silhouettes/:asset",
        destination: "/images/graphics/wedding/silhouettes/:asset",
        permanent: true,
      },
      {
        source: "/images/graphics/wedding-watercolour/:asset",
        destination: "/images/graphics/wedding/watercolour/:asset",
        permanent: true,
      },
      {
        source: "/images/graphics/wedding/:asset",
        destination: "/images/graphics/wedding/editorial/:asset",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
