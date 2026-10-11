import { AppError } from "../errors/app-error.js";

const productIdPattern = /^[1-9][0-9]*$/;

export function validateProductId(req, _res, next) {
  if (!productIdPattern.test(req.params.id)) {
    return next(new AppError(400, "INVALID_PRODUCT_ID", "Product id must be a positive safe integer."));
  }
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id)) {
    return next(new AppError(400, "INVALID_PRODUCT_ID", "Product id must be a positive safe integer."));
  }
  req.productId = id;
  return next();
}
