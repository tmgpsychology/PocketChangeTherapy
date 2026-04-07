import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import clientsRouter from "./clients";
import goalsRouter from "./goals";
import checkinsRouter from "./checkins";
import portalRouter from "./portal";
import dashboardRouter from "./dashboard";
import remindersRouter from "./reminders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(clientsRouter);
router.use(goalsRouter);
router.use(checkinsRouter);
router.use(portalRouter);
router.use(dashboardRouter);
router.use(remindersRouter);

export default router;
