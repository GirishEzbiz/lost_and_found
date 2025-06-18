import session from "express-session";
import { promisify } from "util";

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production", // Set to `false` in development
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
});


// Promisify the middleware to make it compatible with Next.js API routes
const promisifiedSession = (req, res) =>
  new Promise((resolve, reject) => {
    sessionMiddleware(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

export default promisifiedSession;
