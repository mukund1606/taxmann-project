/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  reactStrictMode: true,
  rewrites: async () => {
    return [
      {
        source: "/py-api/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://localhost:8000/py-api/:path*"
            : "/py-api/",
      },
    ];
  },
};

export default config;
