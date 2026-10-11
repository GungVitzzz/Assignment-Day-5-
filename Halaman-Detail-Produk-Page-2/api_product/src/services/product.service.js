import { AppError } from "../errors/app-error.js";
import { toProductResource } from "../models/product.model.js";
import { productRepository } from "../repositories/product.repository.js";

export const productService = {
  async listProducts() {
    return (await productRepository.list()).map((row) => toProductResource(row));
  },
  async getProductById(id) {
    const row = await productRepository.findById(id);
    if (!row) throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found.");
    return toProductResource(row, { detailed: true });
  },
  async createProduct(input) {
    const id = await productRepository.create({
      name: input.name,
      price: input.price,
      currency: input.currency,
      description: input.description,
      image: input.image,
      variants: input.variants.colorOrSize.map((size) => ({
        size,
        quantity: input.variants.quantity,
      })),
    });
    return this.getProductById(id);
  },
};
