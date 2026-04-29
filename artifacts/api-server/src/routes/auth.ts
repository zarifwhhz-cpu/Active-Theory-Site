import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import {
  clearAdminCookie,
  isAuthed,
  issueAdminCookie,
  verifyAdminPassword,
} from "../lib/auth";

const router: IRouter = Router();

const loginSchema = z.object({ password: z.string().min(1) });

// Per-IP login throttle: 10 attempts per 15 minutes. Successful logins do not
// consume budget so legitimate users are not punished after signing in.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "too_many_attempts" },
});

router.post("/auth/login", loginLimiter, (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  if (!verifyAdminPassword(parsed.data.password)) {
    res.status(401).json({ error: "invalid_credentials" });
    return;
  }
  issueAdminCookie(res);
  res.json({ ok: true });
});

router.post("/auth/logout", (_req, res) => {
  clearAdminCookie(res);
  res.json({ ok: true });
});

router.get("/auth/me", (req, res) => {
  res.json({ authenticated: isAuthed(req) });
});

export default router;
