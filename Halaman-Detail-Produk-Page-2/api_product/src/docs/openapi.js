const requestIdHeader = {
  description: "Request identifier matching meta.requestId.",
  schema: { type: "string", format: "uuid" },
};

const errorContent = {
  "application/json": { schema: { $ref: "#/components/schemas/ApiError" } },
};

function errorResponse(description) {
  return {
    description,
    headers: { "X-Request-Id": requestIdHeader },
    content: errorContent,
  };
}

export const openapiDefinition = {
  openapi: "3.1.0",
  info: {
    title: "Product API",
    version: "1.0.0",
    description: "Product catalogue API for the product detail page.",
  },
  servers: [{ url: "http://localhost:3000" }],
  paths: {
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "List products",
        responses: {
          200: {
            description: "Products returned.",
            headers: { "X-Request-Id": requestIdHeader },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductListResponse" },
              },
            },
          },
          500: errorResponse("Unexpected server error."),
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create a product",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductCreateInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Product created.",
            headers: {
              Location: {
                description: "URL of the newly created product.",
                schema: { type: "string", format: "uri-reference" },
              },
              "X-Request-Id": requestIdHeader,
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductResponse" },
              },
            },
          },
          400: errorResponse("Malformed JSON or invalid request body."),
          404: errorResponse("API route not found."),
          500: errorResponse("Unexpected server error."),
        },
      },
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get product detail",
        parameters: [{
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", minimum: 1, maximum: Number.MAX_SAFE_INTEGER },
        }],
        responses: {
          200: {
            description: "Product returned.",
            headers: { "X-Request-Id": requestIdHeader },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductResponse" },
              },
            },
          },
          400: errorResponse("Product ID is invalid."),
          404: errorResponse("Product or API route not found."),
          500: errorResponse("Unexpected server error."),
        },
      },
    },
  },
  components: {
    schemas: {
      ApiMeta: {
        type: "object",
        required: ["requestId", "timestamp"],
        properties: {
          requestId: { type: "string", format: "uuid" },
          timestamp: { type: "string", format: "date-time" },
          count: { type: "integer", minimum: 0 },
        },
      },
      Product: {
        type: "object",
        required: ["id", "name", "price", "currency", "image", "variants", "description"],
        properties: {
          id: { type: "integer", minimum: 1 },
          name: { type: "string", maxLength: 150 },
          price: { type: "number", exclusiveMinimum: 0 },
          currency: { type: "string", pattern: "^[A-Z]{3}$" },
          image: { type: "string", format: "uri-reference" },
          variants: { $ref: "#/components/schemas/ProductVariants" },
          description: { type: "string", maxLength: 2000 },
        },
      },
      ProductVariants: {
        type: "object",
        required: ["colorOrSize", "quantity"],
        additionalProperties: false,
        properties: {
          colorOrSize: {
            type: "array",
            minItems: 1,
            items: { type: "string", minLength: 1, maxLength: 80 },
          },
          quantity: { type: "integer", minimum: 0, maximum: 999 },
        },
      },
      ProductCreateInput: {
        type: "object",
        additionalProperties: false,
        required: ["name", "price", "currency", "image", "variants", "description"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 150 },
          price: { type: "number", exclusiveMinimum: 0, maximum: 9999999999.99 },
          currency: { type: "string", pattern: "^[A-Z]{3}$" },
          image: {
            type: "string",
            anyOf: [
              { pattern: "^/assets/.+" },
              { type: "string", format: "uri", pattern: "^https://" },
            ],
          },
          variants: { $ref: "#/components/schemas/ProductVariants" },
          description: { type: "string", minLength: 1, maxLength: 2000 },
        },
      },
      ApiError: {
        type: "object",
        required: ["error", "meta"],
        properties: {
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: {
                type: "array",
                items: {
                  type: "object",
                  required: ["field", "message"],
                  properties: {
                    field: { type: "string" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          meta: { $ref: "#/components/schemas/ApiMeta" },
        },
      },
      ProductResponse: {
        type: "object",
        required: ["data", "meta"],
        properties: {
          data: { $ref: "#/components/schemas/Product" },
          meta: { $ref: "#/components/schemas/ApiMeta" },
        },
      },
      ProductListResponse: {
        type: "object",
        required: ["data", "meta"],
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/Product" } },
          meta: { $ref: "#/components/schemas/ApiMeta" },
        },
      },
    },
  },
};
