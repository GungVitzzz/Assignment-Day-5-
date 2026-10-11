import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

let productRepository;
let productService;

beforeAll(async () => {
  process.env.DATABASE_URL ??= "postgresql://user:password@localhost:5432/product_api_test";
  ({ productRepository } = await import("../src/repositories/product.repository.js"));
  ({ productService } = await import("../src/services/product.service.js"));
}, 60000);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("productService", () => {
  it("maps the PRD create input into persistent product records and returns its API resource", async () => {
    const input = {
      name: "Molecule 02",
      price: 135,
      currency: "GBP",
      image: "/assets/molecule-02-bottle.jpg",
      variants: { colorOrSize: ["100 ml", "50 ml"], quantity: 10 },
      description: "A fragrance.",
    };
    vi.spyOn(productRepository, "create").mockResolvedValue(2);
    vi.spyOn(productRepository, "findById").mockResolvedValue({
      id: "2",
      name: input.name,
      price: "135.00",
      currency: "GBP",
      image: input.image,
      variants: [
        { size: "100 ml", quantity: 10 },
        { size: "50 ml", quantity: 10 },
      ],
      description: input.description,
    });

    await expect(productService.createProduct(input)).resolves.toEqual({
      id: 2,
      name: input.name,
      price: 135,
      currency: "GBP",
      image: input.image,
      variants: { colorOrSize: ["100 ml", "50 ml"], quantity: 10 },
      description: input.description,
    });
    expect(productRepository.create).toHaveBeenCalledWith({
      name: input.name,
      price: input.price,
      currency: input.currency,
      image: input.image,
      description: input.description,
      variants: [
        { size: "100 ml", quantity: 10 },
        { size: "50 ml", quantity: 10 },
      ],
    });
  });
});
