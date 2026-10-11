const localOriginPattern = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/;

export function devCors(req, res, next) {
  const origin = req.get("Origin");
  const isDevelopment = process.env.NODE_ENV !== "production";
  if (isDevelopment && origin && localOriginPattern.test(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Expose-Headers", "X-Request-Id");
    res.vary("Origin");
    if (req.method === "OPTIONS") return res.sendStatus(204);
  }
  return next();
}
