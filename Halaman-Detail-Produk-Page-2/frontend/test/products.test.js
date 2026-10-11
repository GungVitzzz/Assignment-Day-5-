import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { fetchProduct, ProductApiError } from "../api/products.js";

const requestId = "018f1f2f-41cc-7f4e-b7dd-634ec8a7b8b8";
const validProduct = {
  id: 1,
  name: "Molecule 01 + Champaca",
  price: 135,
  currency: "GBP",
  image: "/assets/molecule-01-champaca-bottle.jpg",
  variants: { colorOrSize: ["100 ml"], quantity: 10 },
  description: "A fragrance.",
};

function successResponse(data = validProduct) {
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

afterEach(() => mock.restoreAll());

describe("fetchProduct", () => {
  it("fetches and validates the documented product response", async () => {
    const fetchMock = mock.method(globalThis, "fetch", async () => successResponse());
    const result = await fetchProduct(1);

    assert.equal(fetchMock.mock.calls[0].arguments[0].href, "http://localhost:3000/api/products/1");
    assert.equal(fetchMock.mock.calls[0].arguments[1].method, "GET");
    assert.deepEqual(result, { product: validProduct, requestId });
  });

  it("rejects invalid product data and unsafe image sources", async () => {
    mock.method(globalThis, "fetch", async () => successResponse({
      ...validProduct,
      image: "javascript:alert(1)",
    }));

    await assert.rejects(fetchProduct(1), { code: "INVALID_PRODUCT_RESPONSE" });
  });

  it("rejects malformed JSON and incomplete response envelopes", async () => {
    mock.method(globalThis, "fetch", async () => new Response("<html>", {
      status: 200,
      headers: { "X-Request-Id": requestId },
    }));
    await assert.rejects(fetchProduct(1), { code: "INVALID_JSON" });

    mock.restoreAll();
    mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({
      data: validProduct,
      meta: { requestId, timestamp: "not a timestamp" },
    }), {
      status: 200,
      headers: { "X-Request-Id": requestId },
    }));
    await assert.rejects(fetchProduct(1), { code: "INVALID_ENVELOPE" });
  });

  it("maps HTTP errors to safe errors with the server code and correlation ID", async () => {
    mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({
      error: { code: "PRODUCT_NOT_FOUND", message: "Do not expose server detail." },
      meta: { requestId, timestamp: "2026-10-10T08:00:00.000Z" },
    }), {
      status: 404,
      headers: { "X-Request-Id": requestId },
    }));

    await assert.rejects(fetchProduct(1), (error) => {
      assert.ok(error instanceof ProductApiError);
      assert.equal(error.code, "PRODUCT_NOT_FOUND");
      assert.equal(error.message, "Product could not be loaded.");
      assert.equal(error.requestId, requestId);
      assert.equal(error.serverMessage, "Do not expose server detail.");
      return true;
    });
  });

  it("handles validation and server errors without exposing backend messages", async () => {
    for (const [status, code] of [
      [400, "VALIDATION_ERROR"],
      [500, "INTERNAL_SERVER_ERROR"],
    ]) {
      mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({
        error: { code, message: "Backend details must remain private." },
        meta: { requestId, timestamp: "2026-10-10T08:00:00.000Z" },
      }), {
        status,
        headers: { "X-Request-Id": requestId },
      }));

      await assert.rejects(fetchProduct(1), (error) => {
        assert.equal(error.code, code);
        assert.equal(error.message, "Product could not be loaded.");
        assert.equal(error.requestId, requestId);
        return true;
      });
      mock.restoreAll();
    }
  });

  it("reports network failures and request timeouts", async () => {
    mock.method(globalThis, "fetch", async () => {
      throw new TypeError("offline");
    });
    await assert.rejects(fetchProduct(1), { code: "NETWORK_ERROR" });

    mock.restoreAll();
    mock.method(globalThis, "fetch", (_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    }));
    await assert.rejects(fetchProduct(1, { timeoutMs: 1 }), { code: "REQUEST_TIMEOUT" });
  });
});
