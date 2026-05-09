import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware";
import { getMetrics } from "../controllers/dashboard.controller";

const dashboardRouter = Router();

dashboardRouter.use(verificarToken);

dashboardRouter.get("/", getMetrics);

export default dashboardRouter;
