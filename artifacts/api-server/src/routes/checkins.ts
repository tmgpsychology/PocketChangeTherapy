import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, checkinsTable, goalsTable, clientsTable } from "@workspace/db";
import {
  CreateCheckinBody,
  CreateCheckinParams,
  GetGoalCheckinsParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/clients/:code/goals/:goalId/checkins", async (req, res): Promise<void> => {
  const rawGoalId = Array.isArray(req.params.goalId) ? req.params.goalId[0] : req.params.goalId;
  const goalId = parseInt(rawGoalId, 10);
  const checkins = await db.select().from(checkinsTable)
    .where(eq(checkinsTable.goalId, goalId))
    .orderBy(checkinsTable.createdAt);
  res.json(checkins.map(c => ({
    ...c,
    whatWorked: c.whatWorked ?? null,
    whatGotInTheWay: c.whatGotInTheWay ?? null,
    whatCouldYouDoDifferently: c.whatCouldYouDoDifferently ?? null,
    barrierTags: c.barrierTags ?? null,
  })));
});

router.post("/clients/:code/goals/:goalId/checkins", async (req, res): Promise<void> => {
  const rawGoalId = Array.isArray(req.params.goalId) ? req.params.goalId[0] : req.params.goalId;
  const goalId = parseInt(rawGoalId, 10);
  const parsed = CreateCheckinBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [checkin] = await db.insert(checkinsTable).values({
    goalId,
    percentage: parsed.data.percentage,
    whatWorked: parsed.data.whatWorked ?? null,
    whatGotInTheWay: parsed.data.whatGotInTheWay ?? null,
    whatCouldYouDoDifferently: parsed.data.whatCouldYouDoDifferently ?? null,
    barrierTags: parsed.data.barrierTags ?? null,
  }).returning();

  await db.update(goalsTable)
    .set({ currentProgress: parsed.data.percentage })
    .where(eq(goalsTable.id, goalId));

  res.status(201).json({
    ...checkin,
    whatWorked: checkin.whatWorked ?? null,
    whatGotInTheWay: checkin.whatGotInTheWay ?? null,
    whatCouldYouDoDifferently: checkin.whatCouldYouDoDifferently ?? null,
    barrierTags: checkin.barrierTags ?? null,
  });
});

export default router;
