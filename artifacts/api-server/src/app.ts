import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "node:path";
import { existsSync } from "node:fs";
import router from "./routes";

const app: Express = express();

const isProd = process.env["NODE_ENV"] === "production";

app.disable("x-powered-by");

// Only honor X-Forwarded-* headers when explicitly told we're behind a trusted
// reverse proxy (nginx, Caddy, Cloudflare, etc.). Without this gate, a client
// hitting the app directly on port 3001 could spoof X-Forwarded-For and bypass
// the per-IP login rate limiter. Set TRUST_PROXY=1 (or a hop count) in
// docker-compose / systemd when fronting with TLS.
const trustProxyEnv = process.env["TRUST_PROXY"];
if (trustProxyEnv) {
  const asNum = Number(trustProxyEnv);
  app.set("trust proxy", Number.isFinite(asNum) ? asNum : trustProxyEnv);
}

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // Refuse to be framed by anyone — the admin panel never needs to be
    // embedded, so DENY is strictly stronger than the helmet default of
    // SAMEORIGIN against clickjacking.
    frameguard: { action: "deny" },
    strictTransportSecurity: isProd
      ? { maxAge: 60 * 60 * 24 * 365, includeSubDomains: true }
      : false,
  }),
);

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    const lvl =
      res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    process.stdout.write(
      JSON.stringify({
        t: new Date().toISOString(),
        lvl,
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        ms,
      }) + "\n",
    );
  });
  next();
});

app.use("/api", router);

const PUBLIC_DIR = process.env["PUBLIC_DIR"];
if (PUBLIC_DIR && existsSync(PUBLIC_DIR)) {
  app.use(
    express.static(PUBLIC_DIR, {
      index: false,
      setHeaders: (res, filepath) => {
        if (filepath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache");
        } else {
          res.setHeader(
            "Cache-Control",
            "public, max-age=31536000, immutable",
          );
        }
      },
    }),
  );

  const indexHtml = path.join(PUBLIC_DIR, "index.html");
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api")) return next();
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(indexHtml);
  });
}

app.use(
  (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    const status =
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      typeof (err as { status?: unknown }).status === "number"
        ? ((err as { status: number }).status as number)
        : 500;

    const message =
      err instanceof Error ? err.message : "Internal server error";

    process.stderr.write(
      JSON.stringify({
        t: new Date().toISOString(),
        lvl: "error",
        method: req.method,
        url: req.originalUrl,
        status,
        message,
        stack: err instanceof Error ? err.stack : undefined,
      }) + "\n",
    );

    if (res.headersSent) return;

    res.status(status).json({
      error: status >= 500 ? "Internal server error" : message,
    });
  },
);

export default app;
