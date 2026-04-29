import { Router, type IRouter } from "express";
import {
  projectsTable,
  insertProjectSchema,
  updateProjectSchema,
  servicesTable,
  insertServiceSchema,
  updateServiceSchema,
  awardsTable,
  insertAwardSchema,
  updateAwardSchema,
  socialLinksTable,
  insertSocialLinkSchema,
  updateSocialLinkSchema,
} from "@workspace/db";
import settingsRouter from "./settings";
import { makeListResourceRouter } from "./listResource";

const router: IRouter = Router();

router.use(settingsRouter);

router.use(
  makeListResourceRouter({
    path: "projects",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    table: projectsTable as any,
    insertSchema: insertProjectSchema,
    updateSchema: updateProjectSchema,
  }),
);

router.use(
  makeListResourceRouter({
    path: "services",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    table: servicesTable as any,
    insertSchema: insertServiceSchema,
    updateSchema: updateServiceSchema,
  }),
);

router.use(
  makeListResourceRouter({
    path: "awards",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    table: awardsTable as any,
    insertSchema: insertAwardSchema,
    updateSchema: updateAwardSchema,
  }),
);

router.use(
  makeListResourceRouter({
    path: "social-links",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    table: socialLinksTable as any,
    insertSchema: insertSocialLinkSchema,
    updateSchema: updateSocialLinkSchema,
  }),
);

export default router;
