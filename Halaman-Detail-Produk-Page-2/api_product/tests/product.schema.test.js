import { describe, expect, it } from "vitest";
import { productCreateSchema } from "../src/validators/product.schema.js";

const validProduct = {
  name: "Molecule 02",
  price: 135,
  currency: "GBP",
  image: "/assets/molecule-02.jpg",
  variants: { colorOrSize: ["100 ml"], quantity: 10 },
  description: "A fragrance.",
};

describe("productCreateSchema", () => {
  it("accepts a valid product", () => expect(productCreateSchema.safeParse(validProduct).success).toBe(true));
  it("rejects unsafe image URLs", () => expect(productCreateSchema.safeParse({ ...validProduct, image: "javascript:alert(1)" }).success).toBe(false));
  it("rejects malformed HTTPS image URLs", () => expect(productCreateSchema.safeParse({ ...validProduct, image: "https://" }).success).toBe(false));
  it("rejects string prices and prices with more than two decimals", () => {
    expect(productCreateSchema.safeParse({ ...validProduct, price: "135" }).success).toBe(false);
    expect(productCreateSchema.safeParse({ ...validProduct, price: 135.001 }).success).toBe(false);
  });
  it("rejects invalid quantities and empty variants", () => {
    expect(productCreateSchema.safeParse({ ...validProduct, variants: { colorOrSize: ["100 ml"], quantity: 1000 } }).success).toBe(false);
    expect(productCreateSchema.safeParse({ ...validProduct, variants: { colorOrSize: [], quantity: 10 } }).success).toBe(false);
  });
  it("rejects fields outside the allow-list", () => expect(productCreateSchema.safeParse({ ...validProduct, id: "attacker-controlled" }).success).toBe(false));
});
