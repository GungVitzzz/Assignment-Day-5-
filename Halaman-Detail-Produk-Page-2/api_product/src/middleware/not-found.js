import { AppError } from "../errors/app-error.js";

export function apiNotFound(req, _res, next) {
  if (req.path.startsWith("/api/")) return next(new AppError(404, "ROUTE_NOT_FOUND", "API route not found."));
  return next();
}
