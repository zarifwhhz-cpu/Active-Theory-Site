import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import contentRouter from "./content";
import adminRouter from "./admin";
import { sameOriginGuard } from "../lib/auth";

const router: IRouter = Router();

// Public reads
router.use(healthRouter);
router.use(contentRouter);

// Anything that performs a state change with cookie credentials must originate
// from the same site. Applies to /auth/login, /auth/logout, and all /admin/*.
router.use(sameOriginGuard);

router.use(authRouter);
router.use(adminRouter);

export default router;
