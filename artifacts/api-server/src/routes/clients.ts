import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, clientsTable, goalsTable, checkinsTable } from "@workspace/db";
import {
  CreateClientBody,
  UpdateClientBody,
  GetClientParams,
  UpdateClientParams,
  DeleteClientParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateAccessCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function requirePractitioner(req: any, res: any): boolean {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  return true;
}

router.get("/clients", async (req, res): Promise<void> => {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const clients = await db.select().from(clientsTable)
    .where(eq(clientsTable.practitionerId, req.session.userId))
    .orderBy(clientsTable.createdAt);

  const enriched = await Promise.all(clients.map(async (client) => {
    const goals = await db.select().from(goalsTable).where(eq(goalsTable.clientId, client.id));
    const goalIds = goals.map(g => g.id);
    let lastCheckin: string | null = null;
    let averageProgress: number | null = null;
    if (goalIds.length > 0) {
      const checkins = await db.select().from(checkinsTable)
        .where(sql`${checkinsTable.goalId} = ANY(${sql`ARRAY[${sql.join(goalIds.map(id => sql`${id}`), sql`, `)}]::int[]`})`);
      if (checkins.length > 0) {
        const sorted = checkins.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        lastCheckin = sorted[0].createdAt.toISOString();
        averageProgress = checkins.reduce((sum, c) => sum + c.percentage, 0) / checkins.length;
      }
    }
    return {
      ...client,
      email: client.email ?? null,
      notes: client.notes ?? null,
      goalCount: goals.length,
      lastCheckin,
      averageProgress,
    };
  }));

  res.json(enriched);
});

router.post("/clients", async (req, res): Promise<void> => {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const parsed = CreateClientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  let accessCode = generateAccessCode();
  let attempts = 0;
  while (attempts < 10) {
    const [existing] = await db.select().from(clientsTable).where(eq(clientsTable.accessCode, accessCode));
    if (!existing) break;
    accessCode = generateAccessCode();
    attempts++;
  }
  const [client] = await db.insert(clientsTable).values({
    name: parsed.data.name,
    email: parsed.data.email ?? null,
    notes: parsed.data.notes ?? null,
    accessCode,
    practitionerId: req.session.userId,
  }).returning();
  res.status(201).json({
    ...client,
    email: client.email ?? null,
    notes: client.notes ?? null,
    goalCount: 0,
    lastCheckin: null,
    averageProgress: null,
  });
});

router.get("/clients/:code", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.accessCode, raw));
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  res.json({
    ...client,
    email: client.email ?? null,
    notes: client.notes ?? null,
    goalCount: null,
    lastCheckin: null,
    averageProgress: null,
  });
});

router.patch("/clients/:code", async (req, res): Promise<void> => {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const raw = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
  const parsed = UpdateClientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [client] = await db.update(clientsTable)
    .set(parsed.data)
    .where(eq(clientsTable.accessCode, raw))
    .returning();
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  res.json({
    ...client,
    email: client.email ?? null,
    notes: client.notes ?? null,
    goalCount: null,
    lastCheckin: null,
    averageProgress: null,
  });
});

router.delete("/clients/:code", async (req, res): Promise<void> => {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const raw = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
  await db.delete(clientsTable).where(eq(clientsTable.accessCode, raw));
  res.sendStatus(204);
});

export default router;
