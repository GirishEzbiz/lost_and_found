/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: false,

  // Enable SCSS Support
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },

  // Add Environment Variables for Client-side Use
  env: {
    baseURL: process.env.BASE_URL, // Ensure this variable is defined in your environment
    siteName: process.env.SITE_NAME, // Ensure this variable is defined in your environment
  },

  // Enable Image Optimization (optional)
  images: {
    domains: ["your-domain.com"], // Replace with domains you need to load images from
  },

  // Handle server-side modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent bundling of server-side modules
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        child_process: false, // Add if needed
      };
    }
    return config;
  },

  // Optimize Build Performance for Low-Memory Systems
  experimental: {
    workerThreads: false, // Disable worker threads to save memory
    // cpus: 1, // Limit the number of CPUs used for builds
  },

  // Enable production source maps for debugging (optional)
  productionBrowserSourceMaps: true,

  // Add API body parser configuration
  // api: {
  //   bodyParser: {
  //     sizeLimit: "10mb", // Increase the body size limit to 10MB (you can adjust this value)
  //   },
  // },
};

module.exports = {
  output: "standalone",
  // experimental: {
  //   outputFileTracing: true,
  // },
};

module.exports = nextConfig;


// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "ezbiz-technology",
    project: "javascript-nextjs",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
