import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchProduct, ProductApiError } from "../../api/products.js";

const product = {
  id: 1,
  name: "<script>alert(1)</script> Molecule 01 + Champaca",
  price: 135,
  currency: "GBP",
  image: "/assets/molecule-01-champaca-bottle.jpg",
  variants: { colorOrSize: ["100 ml"], quantity: 10 },
  description: "<img src=x onerror=alert(1)> Fragrance description.",
};
const requestId = "018f1f2f-41cc-7f4e-b7dd-634ec8a7b8b8";

function successResponse(data = product) {
  return new Response(JSON.stringify({
    data,
    meta: { requestId, timestamp: "2026-10-10T08:00:00.000Z" },
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": requestId,
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("fetchProduct", () => {
  it("loads the PRD product contract and validates its response envelope", async () => {
    const fetchMock = vi.fn().mockResolvedValue(successResponse());
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchProduct(1);

    expect(fetchMock.mock.calls[0][0].href).toBe("http://localhost:3000/api/products/1");
    expect(fetchMock.mock.calls[0][1].method).toBe("GET");
    expect(fetchMock.mock.calls[0][1].cache).toBe("no-store");
    expect(result).toEqual({
      product: {
        ...product,
        variants: { colorOrSize: ["100 ml"], quantity: 10 },
      },
      requestId,
    });
    expect(result.product.name).toContain("<script>");
    expect(result.product.description).toContain("<img");
  });

  it("rejects products with missing required fields", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(successResponse({
      ...product,
      variants: { colorOrSize: [], quantity: 10 },
    })));

    await expect(fetchProduct(1)).rejects.toMatchObject({
      code: "INVALID_PRODUCT_RESPONSE",
    });
  });

  it("rejects invalid JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>", {
      status: 200,
      headers: { "X-Request-Id": requestId },
    })));

    await expect(fetchProduct(1)).rejects.toMatchObject({ code: "INVALID_JSON" });
  });

  it("uses the server error code without exposing its message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: { code: "PRODUCT_NOT_FOUND", message: "Internal information" },
      meta: { requestId, timestamp: "2026-10-10T08:00:00.000Z" },
    }), {
      status: 404,
      headers: { "X-Request-Id": requestId },
    })));

    await expect(fetchProduct(1)).rejects.toMatchObject({
      code: "PRODUCT_NOT_FOUND",
      message: "Product could not be loaded.",
      requestId,
    });
  });

  it("reports request timeouts", async () => {
    vi.stubGlobal("fetch", vi.fn((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => {
        reject(new DOMException("Aborted", "AbortError"));
      });
    })));

    const productRequest = fetchProduct(1, { timeoutMs: 1 });
    await expect(productRequest).rejects.toBeInstanceOf(ProductApiError);
    await expect(productRequest).rejects.toMatchObject({
      code: "REQUEST_TIMEOUT",
    });
  });
});
