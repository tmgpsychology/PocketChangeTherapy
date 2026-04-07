import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, clientsTable, goalsTable } from "@workspace/db";
import {
  CreateGoalBody,
  UpdateGoalBody,
  CreateGoalParams,
  UpdateGoalParams,
  DeleteGoalParams,
  GetClientGoalsParams,
} from "@workspace/api-zod";
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

router.get("/clients/:code/goals", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.accessCode, raw));
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  const goals = await db.select().from(goalsTable)
    .where(eq(goalsTable.clientId, client.id))
    .orderBy(goalsTable.createdAt);
  res.json(buildGoalTree(goals));
});

router.post("/clients/:code/goals", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.accessCode, raw));
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  const parsed = CreateGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [goal] = await db.insert(goalsTable).values({
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    type: parsed.data.type ?? null,
    parentGoalId: parsed.data.parentGoalId ?? null,
    targetDate: parsed.data.targetDate ?? null,
    clientId: client.id,
    currentProgress: null,
  }).returning();
  res.status(201).json({
    ...goal,
    description: goal.description ?? null,
    type: goal.type ?? null,
    parentGoalId: goal.parentGoalId ?? null,
    currentProgress: goal.currentProgress ?? null,
    targetDate: goal.targetDate ?? null,
    subGoals: [],
  });
});

router.patch("/clients/:code/goals/:goalId", async (req, res): Promise<void> => {
  const rawCode = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
  const rawGoalId = Array.isArray(req.params.goalId) ? req.params.goalId[0] : req.params.goalId;
  const goalId = parseInt(rawGoalId, 10);
  const parsed = UpdateGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [goal] = await db.update(goalsTable)
    .set(parsed.data)
    .where(eq(goalsTable.id, goalId))
    .returning();
  if (!goal) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }
  res.json({
    ...goal,
    description: goal.description ?? null,
    type: goal.type ?? null,
    parentGoalId: goal.parentGoalId ?? null,
    currentProgress: goal.currentProgress ?? null,
    targetDate: goal.targetDate ?? null,
    subGoals: [],
  });
});

router.delete("/clients/:code/goals/:goalId", async (req, res): Promise<void> => {
  const rawGoalId = Array.isArray(req.params.goalId) ? req.params.goalId[0] : req.params.goalId;
  const goalId = parseInt(rawGoalId, 10);
  await db.delete(goalsTable).where(eq(goalsTable.id, goalId));
  res.sendStatus(204);
});

export default router;
