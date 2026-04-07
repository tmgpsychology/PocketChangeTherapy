import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, clientsTable, goalsTable, checkinsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard", async (req, res): Promise<void> => {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const practitionerId = req.session.userId;
  const clients = await db.select().from(clientsTable)
    .where(eq(clientsTable.practitionerId, practitionerId))
    .orderBy(clientsTable.createdAt);

  let totalCheckins = 0;
  let activeClients = 0;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const enrichedClients = await Promise.all(clients.map(async (client) => {
    const goals = await db.select().from(goalsTable).where(eq(goalsTable.clientId, client.id));
    const goalIds = goals.map(g => g.id);
    let lastCheckin: string | null = null;
    let averageProgress: number | null = null;
    if (goalIds.length > 0) {
      const checkins = await db.select().from(checkinsTable)
        .where(sql`${checkinsTable.goalId} = ANY(${sql`ARRAY[${sql.join(goalIds.map(id => sql`${id}`), sql`, `)}]::int[]`})`);
      totalCheckins += checkins.length;
      if (checkins.length > 0) {
        const sorted = checkins.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        lastCheckin = sorted[0].createdAt.toISOString();
        averageProgress = checkins.reduce((sum, c) => sum + c.percentage, 0) / checkins.length;
        if (new Date(sorted[0].createdAt) > sevenDaysAgo) activeClients++;
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

  const recentActivity: any[] = [];
  for (const client of clients) {
    const goals = await db.select().from(goalsTable).where(eq(goalsTable.clientId, client.id));
    for (const goal of goals) {
      const checkins = await db.select().from(checkinsTable)
        .where(eq(checkinsTable.goalId, goal.id))
        .orderBy(desc(checkinsTable.createdAt))
        .limit(2);
      for (const checkin of checkins) {
        recentActivity.push({
          clientName: client.name,
          goalTitle: goal.title,
          percentage: checkin.percentage,
          createdAt: checkin.createdAt.toISOString(),
        });
      }
    }
  }
  recentActivity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    totalClients: clients.length,
    activeClients,
    totalCheckins,
    clients: enrichedClients,
    recentActivity: recentActivity.slice(0, 10),
  });
});

export default router;
