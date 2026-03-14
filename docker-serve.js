/**
 * Production entrypoint for Docker.
 * Starts the API server and serves the built frontend static files.
 */
import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.env.PORT ?? 3001);
const PUBLIC_DIR = join(__dirname, "public");

// MIME types for static files
const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".otf": "font/otf",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
};

// Import the compiled API server app
const { default: app } = await import("./artifacts/api-server/dist/index.cjs", {
  assert: {},
}).catch(() => ({ default: null }));

const server = createServer((req, res) => {
  // Let Express handle /api routes
  if (req.url?.startsWith("/api") && app) {
    return app(req, res);
  }

  // Serve static frontend files
  const urlPath = req.url?.split("?")[0] ?? "/";
  let filePath = join(PUBLIC_DIR, urlPath === "/" ? "index.html" : urlPath);

  if (!existsSync(filePath)) {
    // SPA fallback — serve index.html for unknown paths
    filePath = join(PUBLIC_DIR, "index.html");
  }

  const ext = extname(filePath);
  const contentType = MIME[ext] ?? "application/octet-stream";

  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", ext === ".html" ? "no-cache" : "public, max-age=31536000");
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
