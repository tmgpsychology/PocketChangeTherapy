import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, smsRemindersTable } from "@workspace/db";
import { SaveSmsReminderBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/client-portal/sms-reminder", async (req, res): Promise<void> => {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [reminder] = await db.select().from(smsRemindersTable)
    .where(eq(smsRemindersTable.userId, req.session.userId));
  if (!reminder) {
    res.status(404).json({ error: "No reminder configured" });
    return;
  }
  res.json(reminder);
});

router.post("/client-portal/sms-reminder", async (req, res): Promise<void> => {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const parsed = SaveSmsReminderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = req.session.userId;
  const [existing] = await db.select().from(smsRemindersTable)
    .where(eq(smsRemindersTable.userId, userId));
  let reminder;
  if (existing) {
    [reminder] = await db.update(smsRemindersTable)
      .set(parsed.data)
      .where(eq(smsRemindersTable.userId, userId))
      .returning();
  } else {
    [reminder] = await db.insert(smsRemindersTable)
      .values({ ...parsed.data, userId })
      .returning();
  }
  res.json(reminder);
});

router.delete("/client-portal/sms-reminder", async (req, res): Promise<void> => {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  await db.delete(smsRemindersTable)
    .where(eq(smsRemindersTable.userId, req.session.userId));
  res.json({ message: "Reminder deleted" });
});

export default router;
