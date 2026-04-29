import { Router, type IRouter, type Request, type Response } from "express";
import { eq, asc } from "drizzle-orm";
import { db } from "@workspace/db";
import type { PgTableWithColumns } from "drizzle-orm/pg-core";
import type { ZodType } from "zod";
import { requireAdmin } from "../../lib/auth";

interface ListResourceOptions<TInsert, TUpdate> {
  path: string; // e.g. "projects"
  table: PgTableWithColumns<{
    name: string;
    schema: undefined;
    columns: {
      id: { _: { name: "id" } };
      sortOrder?: { _: { name: "sort_order" } };
    } & Record<string, unknown>;
    dialect: "pg";
  }> & {
    id: { name: "id" };
    sortOrder: { name: "sort_order" };
  };
  insertSchema: ZodType<TInsert>;
  updateSchema: ZodType<TUpdate>;
}

export function makeListResourceRouter<TInsert extends object, TUpdate extends object>(
  opts: ListResourceOptions<TInsert, TUpdate>,
): IRouter {
  const { path, table, insertSchema, updateSchema } = opts;
  const router: IRouter = Router();
  router.use(requireAdmin);

  // List
  router.get(`/admin/${path}`, async (_req: Request, res: Response) => {
    try {
      const rows = await db
        .select()
        .from(table as unknown as never)
        .orderBy(asc((table as unknown as { sortOrder: unknown }).sortOrder as never), asc((table as unknown as { id: unknown }).id as never));
      res.json(rows);
    } catch (err) {
      console.error(`GET /admin/${path} failed`, err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  // Create
  router.post(`/admin/${path}`, async (req: Request, res: Response) => {
    const parsed = insertSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body", details: (parsed.error as { flatten?: () => unknown }).flatten?.() });
      return;
    }
    try {
      const inserted = await db
        .insert(table as unknown as never)
        .values(parsed.data as never)
        .returning();
      res.status(201).json((inserted as unknown as object[])[0]);
    } catch (err) {
      console.error(`POST /admin/${path} failed`, err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  // Update
  router.patch(`/admin/${path}/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "invalid_id" });
      return;
    }
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body", details: (parsed.error as { flatten?: () => unknown }).flatten?.() });
      return;
    }
    try {
      const idCol = (table as unknown as { id: unknown }).id as never;
      const updated = await db
        .update(table as unknown as never)
        .set(parsed.data as never)
        .where(eq(idCol, id as never))
        .returning();
      const rows = updated as unknown as object[];
      if (rows.length === 0) {
        res.status(404).json({ error: "not_found" });
        return;
      }
      res.json(rows[0]);
    } catch (err) {
      console.error(`PATCH /admin/${path}/:id failed`, err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  // Delete
  router.delete(`/admin/${path}/:id`, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "invalid_id" });
      return;
    }
    try {
      const idCol = (table as unknown as { id: unknown }).id as never;
      const deleted = await db
        .delete(table as unknown as never)
        .where(eq(idCol, id as never))
        .returning();
      const rows = deleted as unknown as object[];
      if (rows.length === 0) {
        res.status(404).json({ error: "not_found" });
        return;
      }
      res.json({ ok: true });
    } catch (err) {
      console.error(`DELETE /admin/${path}/:id failed`, err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  return router;
}
