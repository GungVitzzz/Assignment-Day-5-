import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const product = {
  id: 1,
  name: "Molecule 01 + Champaca",
  price: 135,
  currency: "GBP",
  image: "/assets/molecule-01-champaca-bottle.jpg",
  variants: { colorOrSize: ["100 ml"], quantity: 10 },
  description: "A fragrance.",
};
const createdProduct = { ...product, id: 2, name: "Molecule 02" };
const validInput = {
  name: "Molecule 02",
  price: 135,
  currency: "GBP",
  image: "/assets/molecule-02-bottle.jpg",
  variants: { colorOrSize: ["100 ml"], quantity: 10 },
  description: "A fragrance.",
};

let app;
let productService;
let pool;

beforeAll(async () => {
  process.env.DATABASE_URL ??= "postgresql://user:password@localhost:5432/product_api_test";
  ({ app } = await import("../src/app.js"));
  ({ productService } = await import("../src/services/product.service.js"));
  ({ pool } = await import("../src/config/database.js"));
}, 60000);

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(productService, "listProducts").mockResolvedValue([product]);
  vi.spyOn(productService, "getProductById").mockResolvedValue(product);
  vi.spyOn(productService, "createProduct").mockResolvedValue(createdProduct);
});

afterAll(async () => {
  if (pool) await pool.end();
});

describe("product API HTTP contract", () => {
  it("returns a list in the PRD envelope with a matching request ID", async () => {
    const response = await request(app).get("/api/products").expect(200);
    expect(response.body.data).toEqual([product]);
    expect(response.body.meta.count).toBe(1);
    expect(response.body.meta.requestId).toBe(response.headers["x-request-id"]);
  });

  it("accepts positive integer IDs and rejects invalid IDs", async () => {
    const validResponse = await request(app).get("/api/products/1").expect(200);
    expect(validResponse.body.data).toEqual(product);
    expect(productService.getProductById).toHaveBeenCalledWith(1);

    const invalidResponse = await request(app).get("/api/products/01").expect(400);
    expect(invalidResponse.body.error.code).toBe("INVALID_PRODUCT_ID");
    expect(invalidResponse.body.meta.requestId).toBe(invalidResponse.headers["x-request-id"]);
  });

  it("creates products using the PRD contract and returns a Location header", async () => {
    const response = await request(app)
      .post("/api/products")
      .send(validInput)
      .expect(201);

    expect(productService.createProduct).toHaveBeenCalledWith(validInput);
    expect(response.headers.location).toBe("/api/products/2");
    expect(response.body.data).toEqual(createdProduct);
    expect(response.body.meta.requestId).toBe(response.headers["x-request-id"]);
  });

  it("rejects invalid bodies without calling the service", async () => {
    const response = await request(app)
      .post("/api/products")
      .send({ ...validInput, id: 99 })
      .expect(400);

    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(productService.createProduct).not.toHaveBeenCalled();
  });

  it("returns malformed JSON as a standard JSON error", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("Content-Type", "application/json")
      .send('{"name":')
      .expect(400);

    expect(response.body.error.code).toBe("INVALID_JSON");
    expect(response.body.meta.requestId).toBe(response.headers["x-request-id"]);
  });

  it("returns an API not-found envelope", async () => {
    const response = await request(app).get("/api/missing").expect(404);
    expect(response.body.error.code).toBe("ROUTE_NOT_FOUND");
    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });

  it("allows local development origins and answers preflight requests", async () => {
    const response = await request(app)
      .options("/api/products/1")
      .set("Origin", "http://localhost:5500")
      .set("Access-Control-Request-Method", "GET")
      .expect(204);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5500");
    expect(response.headers["access-control-expose-headers"]).toContain("X-Request-Id");
  });

  it("does not allow cross-origin access from non-local origins", async () => {
    const response = await request(app)
      .get("/api/products")
      .set("Origin", "https://example.com")
      .expect(200);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("publishes the OpenAPI document for the PRD contract", async () => {
    const response = await request(app).get("/openapi.json").expect(200);
    expect(response.body.openapi).toBe("3.1.0");
    expect(response.body.paths["/api/products/{id}"].get.parameters[0].schema.type).toBe("integer");
    expect(response.body.components.schemas.Product.properties.image.type).toBe("string");
    expect(response.body.components.schemas.ProductVariants.properties.colorOrSize.type).toBe("array");
  });
});
