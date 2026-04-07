import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const smsRemindersTable = pgTable("sms_reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  phone: text("phone").notNull(),
  days: text("days").notNull(),
  time: text("time").notNull(),
  timezone: text("timezone").notNull(),
  messageTemplate: text("message_template").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSmsReminderSchema = createInsertSchema(smsRemindersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSmsReminder = z.infer<typeof insertSmsReminderSchema>;
export type SmsReminder = typeof smsRemindersTable.$inferSelect;
