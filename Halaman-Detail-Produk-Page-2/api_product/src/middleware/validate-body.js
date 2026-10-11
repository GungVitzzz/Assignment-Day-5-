import { AppError } from "../errors/app-error.js";
import { productCreateSchema } from "../validators/product.schema.js";

export function validateProductBody(req, _res, next) {
  const result = productCreateSchema.safeParse(req.body);
  if (result.success) {
    req.validatedBody = result.data;
    return next();
  }
  const details = result.error.issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    message: issue.message,
  }));
  return next(new AppError(400, "VALIDATION_ERROR", "Request body is invalid.", details));
}
