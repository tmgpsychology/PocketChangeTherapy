import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const checkinsTable = pgTable("checkins", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(),
  percentage: real("percentage").notNull(),
  whatWorked: text("what_worked"),
  whatGotInTheWay: text("what_got_in_the_way"),
  whatCouldYouDoDifferently: text("what_could_you_do_differently"),
  barrierTags: text("barrier_tags"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCheckinSchema = createInsertSchema(checkinsTable).omit({ id: true, createdAt: true });
export type InsertCheckin = z.infer<typeof insertCheckinSchema>;
export type Checkin = typeof checkinsTable.$inferSelect;
