import { randomUUID } from "node:crypto";

export function requestId(req, res, next) {
  const id = randomUUID();
  req.requestId = id;
  res.locals.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
}
