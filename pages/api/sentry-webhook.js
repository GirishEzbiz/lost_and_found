import logger from "lib/logger";

// pages/api/sentry-webhook.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const payload = req.body;

  logger.error({
    message: payload,
    stack: "sss",
    function: "Sentry Response",
  });

  res.status(200).json({ message: "Received" });
}
