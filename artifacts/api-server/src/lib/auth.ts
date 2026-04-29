import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

const SESSION_COOKIE = "at_admin";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "SESSION_SECRET must be set to a string of at least 16 characters.",
    );
  }
  return s;
}

function getAdminPassword(): string {
  const p = process.env.ADMIN_PASSWORD;
  if (!p || p.length < 1) {
    throw new Error("ADMIN_PASSWORD must be set.");
  }
  return p;
}

/**
 * Constant-time password compare.
 * Both inputs are hashed with SHA-256 first to guarantee equal-length buffers
 * (so length differences do not leak via early-exit), and the comparison uses
 * `crypto.timingSafeEqual` which is a constant-time primitive.
 */
export function verifyAdminPassword(password: string): boolean {
  if (typeof password !== "string") return false;
  const expected = getAdminPassword();
  const a = crypto.createHash("sha256").update(password, "utf8").digest();
  const b = crypto.createHash("sha256").update(expected, "utf8").digest();
  return crypto.timingSafeEqual(a, b);
}

export function issueAdminCookie(res: Response) {
  const token = jwt.sign({ role: "admin" }, getSecret(), {
    expiresIn: TOKEN_TTL_SECONDS,
  });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_TTL_SECONDS * 1000,
    path: "/",
  });
}

export function clearAdminCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export function isAuthed(req: Request): boolean {
  const token = (req.cookies ?? {})[SESSION_COOKIE];
  if (!token || typeof token !== "string") return false;
  try {
    const payload = jwt.verify(token, getSecret()) as { role?: string };
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!isAuthed(req)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}

/**
 * CSRF defense for cookie-authenticated state-changing requests.
 * For any non-safe method (POST/PUT/PATCH/DELETE), require the request to
 * come from the same origin as the server (Origin or Referer header check).
 *
 * This complements `SameSite=Lax` on the cookie: lax already blocks
 * cross-site form/AJAX cookie sends in modern browsers, and Origin/Referer
 * checking blocks the residual same-site-but-different-origin attack surface.
 */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function sameOriginGuard(req: Request, res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) return next();

  const host = req.get("host");
  if (!host) {
    res.status(403).json({ error: "forbidden" });
    return;
  }

  const sources: string[] = [];
  const origin = req.get("origin");
  const referer = req.get("referer");
  if (origin) sources.push(origin);
  if (referer) sources.push(referer);

  if (sources.length === 0) {
    res.status(403).json({ error: "forbidden_origin_missing" });
    return;
  }

  for (const src of sources) {
    try {
      const u = new URL(src);
      if (u.host === host) return next();
    } catch {
      // ignore malformed
    }
  }

  res.status(403).json({ error: "forbidden_cross_origin" });
}
