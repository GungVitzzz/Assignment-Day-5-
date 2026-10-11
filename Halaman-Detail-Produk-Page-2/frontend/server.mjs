import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const frontendDirectory = fileURLToPath(new URL(".", import.meta.url));
const assetDirectory = resolve(frontendDirectory, "..", "assets");
const port = Number(process.env.FRONTEND_PORT ?? 5501);
const productApiBaseUrl = process.env.PRODUCT_API_BASE_URL;
if (productApiBaseUrl) {
  const apiUrl = new URL(productApiBaseUrl);
  if (
    !["http:", "https:"].includes(apiUrl.protocol) ||
    apiUrl.username ||
    apiUrl.password
  ) {
    throw new Error("PRODUCT_API_BASE_URL must be an HTTP(S) URL without credentials.");
  }
}
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
]);
const staticFiles = new Map([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/styles.css", "styles.css"],
  ["/script.js", "script.js"],
  ["/api/products.js", "api/products.js"],
]);
const assetNamePattern = /^[a-z0-9-]+\.jpg$/i;

function getFile(pathname) {
  if (pathname.startsWith("/assets/")) {
    const name = pathname.slice("/assets/".length);
    if (!assetNamePattern.test(name)) return null;
    return resolve(assetDirectory, name);
  }
  const relativePath = staticFiles.get(pathname);
  return relativePath ? resolve(frontendDirectory, relativePath) : null;
}

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  const filename = getFile(pathname);
  if (!filename) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
    return;
  }

  try {
    let content = await readFile(filename);
    if (pathname === "/" || pathname === "/index.html") {
      if (productApiBaseUrl) {
        content = Buffer.from(content.toString("utf8").replace(
          'content="http://localhost:3000"',
          `content="${productApiBaseUrl.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}"`,
        ));
      }
    }
    response.writeHead(200, {
      "Content-Type": contentTypes.get(extname(filename)) ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch (error) {
    if (error.code === "ENOENT") {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
      return;
    }
    console.error("Unable to serve frontend file.", { pathname, error });
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" }).end("Unable to serve file");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Product detail frontend listening on http://localhost:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
