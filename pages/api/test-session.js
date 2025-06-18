import sessionMiddleware from "../../lib/session";

export default async function handler(req, res) {
  await sessionMiddleware(req, res);

  // Test session data
  if (!req.session.views) {
    req.session.views = 1;
  } else {
    req.session.views += 1;
  }

  res.status(200).json({
    message: `You have visited this page ${req.session.views} times.`,
  });
}
