// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     unoptimized: true,
//   },
//   reactStrictMode: true,
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow importing CommonJS packages with named exports more permissively.
  // This helps when packages (like some vanilla-extract builds) export
  // CommonJS-style modules but are imported as ESM in other packages
  // (for example @rainbow-me/rainbowkit -> @vanilla-extract).
  // 'loose' relaxes strict ESM checks and avoids the named export error.
  experimental: {
    esmExternals: 'loose',
  },
  // Transpile these packages so Next processes them through Babel/webpack.
  // This helps when a dependency ships in CommonJS or mixed formats.
  // (Supported in Next 13+)
  transpilePackages: [
    '@rainbow-me/rainbowkit',
    '@vanilla-extract/sprinkles',
  ],
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
  },
  // Make sure environment variables are properly handled
  env: {
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    // Add other environment variables here
  },
  // Safely handle client-side references
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
