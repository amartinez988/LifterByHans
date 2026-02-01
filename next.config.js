const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
    instrumentationHook: true,
  },
};

module.exports = withSentryConfig(nextConfig, {
  // Suppress source map upload logs during build
  silent: true,

  // Widen client file upload to ensure all files are caught
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements
  disableLogger: true,

  // Hide source maps from client bundles in production
  hideSourceMaps: true,
});
