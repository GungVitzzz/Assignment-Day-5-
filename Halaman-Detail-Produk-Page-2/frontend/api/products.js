const configuredApiBaseUrl = typeof document === "undefined"
  ? null
  : document.querySelector('meta[name="product-api-base-url"]')?.content;
const DEFAULT_API_BASE_URL = configuredApiBaseUrl || "http://localhost:3000";
const REQUEST_TIMEOUT_MS = 8000;
const requestIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ProductApiError extends Error {
  constructor(
    message,
    { code = "PRODUCT_API_ERROR", requestId = null, serverMessage = null } = {},
  ) {
    super(message);
    this.name = "ProductApiError";
    this.code = code;
    this.requestId = requestId;
    this.serverMessage = serverMessage;
  }
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidImageUrl(image) {
  if (typeof image !== "string" || image.trim() !== image || image.length > 2048) {
    return false;
  }
  if (image.startsWith("/assets/")) return true;

  try {
    const url = new URL(image);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function validateProduct(product, expectedId) {
  if (
    !isRecord(product) ||
    !Number.isSafeInteger(product.id) ||
    product.id !== expectedId ||
    typeof product.name !== "string" ||
    product.name.trim().length === 0 ||
    product.name.trim().length > 150 ||
    !Number.isFinite(product.price) ||
    product.price <= 0 ||
    product.price > 9999999999.99 ||
    typeof product.currency !== "string" ||
    !/^[A-Z]{3}$/.test(product.currency) ||
    !isValidImageUrl(product.image) ||
    !isRecord(product.variants) ||
    !Array.isArray(product.variants.colorOrSize) ||
    product.variants.colorOrSize.length < 1 ||
    product.variants.colorOrSize.length > 20 ||
    !product.variants.colorOrSize.every(
      (value) =>
        typeof value === "string" &&
        value.trim().length > 0 &&
        value.trim().length <= 80,
    ) ||
    !Number.isInteger(product.variants.quantity) ||
    product.variants.quantity < 0 ||
    product.variants.quantity > 999 ||
    typeof product.description !== "string" ||
    product.description.trim().length === 0 ||
    product.description.trim().length > 2000
  ) {
    throw new ProductApiError("Product response does not match the API contract.", {
      code: "INVALID_PRODUCT_RESPONSE",
    });
  }

  try {
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: product.currency,
    });
  } catch {
    throw new ProductApiError("Product response has an unsupported currency.", {
      code: "INVALID_PRODUCT_RESPONSE",
    });
  }

  return {
    ...product,
    name: product.name.trim(),
    variants: {
      colorOrSize: product.variants.colorOrSize.map((value) => value.trim()),
      quantity: product.variants.quantity,
    },
    description: product.description.trim(),
  };
}

export async function fetchProduct(
  productId = 1,
  { baseUrl = DEFAULT_API_BASE_URL, timeoutMs = REQUEST_TIMEOUT_MS } = {},
) {
  if (!Number.isSafeInteger(productId) || productId < 1) {
    throw new TypeError("productId must be a positive safe integer.");
  }

  const url = new URL(
    `/api/products/${productId}`,
    baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
  );
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: controller.signal,
      });
    } catch {
      if (controller.signal.aborted) {
        throw new ProductApiError("Product request timed out.", {
          code: "REQUEST_TIMEOUT",
        });
      }
      throw new ProductApiError("Product service could not be reached.", {
        code: "NETWORK_ERROR",
      });
    }

    let body;
    try {
      body = await response.json();
    } catch {
      if (controller.signal.aborted) {
        throw new ProductApiError("Product request timed out.", {
          code: "REQUEST_TIMEOUT",
        });
      }
      throw new ProductApiError("Product service returned an invalid response.", {
        code: "INVALID_JSON",
        requestId: response.headers.get("X-Request-Id"),
      });
    }

    const responseRequestId = response.headers.get("X-Request-Id");
    const bodyRequestId = isRecord(body) && isRecord(body.meta)
      ? body.meta.requestId
      : null;
    const requestId = requestIdPattern.test(responseRequestId ?? "")
      ? responseRequestId
      : requestIdPattern.test(bodyRequestId ?? "")
        ? bodyRequestId
        : null;

    if (!response.ok) {
      const responseError = isRecord(body) && isRecord(body.error) ? body.error : null;
      const code = typeof responseError?.code === "string"
        ? responseError.code
        : `HTTP_${response.status}`;
      const serverMessage = typeof responseError?.message === "string"
        ? responseError.message
        : null;
      throw new ProductApiError("Product could not be loaded.", {
        code,
        requestId,
        serverMessage,
      });
    }

    if (
      !isRecord(body) ||
      !isRecord(body.meta) ||
      !requestIdPattern.test(body.meta.requestId ?? "") ||
      body.meta.requestId !== responseRequestId ||
      typeof body.meta.timestamp !== "string" ||
      !Number.isFinite(Date.parse(body.meta.timestamp))
    ) {
      throw new ProductApiError("Product service returned an invalid response.", {
        code: "INVALID_ENVELOPE",
        requestId,
      });
    }

    return {
      product: validateProduct(body.data, productId),
      requestId,
    };
  } finally {
    clearTimeout(timeout);
  }
}
