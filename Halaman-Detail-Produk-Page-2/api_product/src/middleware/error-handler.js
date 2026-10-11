import { AppError } from "../errors/app-error.js";
import { sendError } from "../utils/api-response.js";

export function errorHandler(error, req, res, _next) {
  if (error instanceof SyntaxError && "body" in error) {
    return sendError(res, 400, "INVALID_JSON", "Request body must be valid JSON.");
  }
  if (error instanceof AppError) return sendError(res, error.status, error.code, error.message, error.details);
  console.error({ requestId: req.requestId, error });
  return sendError(res, 500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred.");
}
