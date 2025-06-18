import * as Sentry from "@sentry/nextjs";

const isLocalhost = () => {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "development" ||
    process.env.HOSTNAME === "localhost"
  );
};

if (!isLocalhost()) {
  Sentry.init({
    dsn: "https://a61bf36f0842a675093c1621edf4221b@o4509229958889472.ingest.us.sentry.io/4509229959938048",
    tracesSampleRate: 1,
    debug: false,
  });
}
