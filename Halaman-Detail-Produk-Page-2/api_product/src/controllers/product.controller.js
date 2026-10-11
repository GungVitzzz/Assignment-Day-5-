import { productService } from "../services/product.service.js";
import { sendSuccess } from "../utils/api-response.js";

export const productController = {
  async list(req, res, next) {
    try {
      const products = await productService.listProducts();
      return sendSuccess(res, 200, products, { count: products.length });
    } catch (error) { return next(error); }
  },
  async getById(req, res, next) {
    try { return sendSuccess(res, 200, await productService.getProductById(req.productId)); }
    catch (error) { return next(error); }
  },
  async create(req, res, next) {
    try {
      const product = await productService.createProduct(req.validatedBody);
      res.setHeader("Location", `/api/products/${product.id}`);
      return sendSuccess(res, 201, product);
    } catch (error) { return next(error); }
  },
};
