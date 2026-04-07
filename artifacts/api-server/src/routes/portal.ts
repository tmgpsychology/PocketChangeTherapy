import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, clientsTable, goalsTable, usersTable } from "@workspace/db";
import type { Goal } from "@workspace/db";

const router: IRouter = Router();

function buildGoalTree(goals: Goal[]): any[] {
  const map = new Map<number, any>();
  const roots: any[] = [];
  for (const goal of goals) {
    map.set(goal.id, { ...goal, description: goal.description ?? null, type: goal.type ?? null, parentGoalId: goal.parentGoalId ?? null, currentProgress: goal.currentProgress ?? null, targetDate: goal.targetDate ?? null, subGoals: [] });
  }
  for (const goal of goals) {
    const node = map.get(goal.id)!;
    if (goal.parentGoalId && map.has(goal.parentGoalId)) {
      map.get(goal.parentGoalId)!.subGoals.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

router.get("/clients/:code/portal", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.accessCode, raw));
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  const [practitioner] = await db.select().from(usersTable).where(eq(usersTable.id, client.practitionerId));
  const goals = await db.select().from(goalsTable)
    .where(eq(goalsTable.clientId, client.id))
    .orderBy(goalsTable.createdAt);
  res.json({
    client: {
      ...client,
      email: client.email ?? null,
      notes: client.notes ?? null,
      goalCount: null,
      lastCheckin: null,
      averageProgress: null,
    },
    practitionerName: practitioner?.name ?? "Your Practitioner",
    goals: buildGoalTree(goals),
  });
});

export default router;
