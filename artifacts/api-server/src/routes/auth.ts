import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  LoginBody,
  RegisterBody,
  LinkClientCodeBody,
  VerifySecurityQuestionBody,
  ResetPasswordBody,
} from "@workspace/api-zod";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const router: IRouter = Router();

router.get("/auth/user", async (req, res): Promise<void> => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  let accessCode: string | null = null;
  if (user.linkedClientId) {
    const { clientsTable } = await import("@workspace/db");
    const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, user.linkedClientId));
    accessCode = client?.accessCode ?? null;
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    linkedClientId: user.linkedClientId ?? null,
    accessCode,
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  req.session.userId = user.id;
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    linkedClientId: user.linkedClientId ?? null,
    accessCode: null,
  });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, name, password, role, securityQuestion, securityAnswer } = parsed.data;
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    email,
    name,
    passwordHash,
    role: role ?? "client",
    securityQuestion: securityQuestion ?? null,
    securityAnswer: securityAnswer ? securityAnswer.toLowerCase().trim() : null,
  }).returning();
  req.session.userId = user.id;
  res.status(201).json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    linkedClientId: user.linkedClientId ?? null,
    accessCode: null,
  });
});

router.post("/auth/link-client", async (req, res): Promise<void> => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const parsed = LinkClientCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { accessCode } = parsed.data;
  const { clientsTable } = await import("@workspace/db");
  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.accessCode, accessCode));
  if (!client) {
    res.status(400).json({ error: "Invalid access code" });
    return;
  }
  const [updated] = await db.update(usersTable)
    .set({ linkedClientId: client.id })
    .where(eq(usersTable.id, userId))
    .returning();
  res.json({
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
    linkedClientId: updated.linkedClientId ?? null,
    accessCode: client.accessCode,
  });
});

router.post("/auth/reset-password/verify-question", async (req, res): Promise<void> => {
  const parsed = VerifySecurityQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, answer } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || !user.securityQuestion || !user.securityAnswer) {
    res.status(400).json({ error: "Account not found or no security question set" });
    return;
  }
  if (answer.toLowerCase().trim() !== user.securityAnswer) {
    res.status(400).json({ error: "Incorrect answer" });
    return;
  }
  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 15 * 60 * 1000);
  await db.update(usersTable)
    .set({ resetToken, resetTokenExpiry: expiry })
    .where(eq(usersTable.id, user.id));
  res.json({
    resetToken,
    question: user.securityQuestion,
  });
});

router.post("/auth/reset-password/reset", async (req, res): Promise<void> => {
  const parsed = ResetPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { resetToken, newPassword } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.resetToken, resetToken));
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    res.status(400).json({ error: "Invalid or expired token" });
    return;
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(usersTable)
    .set({ passwordHash, resetToken: null, resetTokenExpiry: null })
    .where(eq(usersTable.id, user.id));
  res.json({ message: "Password reset successfully" });
});

export default router;
