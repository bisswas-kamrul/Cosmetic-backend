const requestLog = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

const aiRateLimiter = (req, res, next) => {
  const key = req.ip || req.headers["x-forwarded-for"] || "unknown";
  const now = Date.now();
  const current = requestLog.get(key) || { count: 0, resetAt: now + WINDOW_MS };

  if (now > current.resetAt) {
    current.count = 0;
    current.resetAt = now + WINDOW_MS;
  }

  if (current.count >= MAX_REQUESTS) {
    return res.status(429).json({
      message: "Too many chat requests. Please try again shortly.",
    });
  }

  current.count += 1;
  requestLog.set(key, current);
  next();
};

module.exports = aiRateLimiter;
