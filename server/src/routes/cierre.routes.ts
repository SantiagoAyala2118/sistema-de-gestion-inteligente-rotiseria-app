import { Router } from "express";
import {
  createDayClosing,
  getDayClosings,
  getDayClosingById,
  getTodayDayClosing,
} from "../controllers/endDay.controller";
import { verificarToken, soloAdmin } from "../middlewares/auth.middleware";

const dayClosingRouter = Router();

dayClosingRouter.use(verificarToken);

// Ejecutar el cierre solo lo puede hacer el administrador
dayClosingRouter.post("/", soloAdmin, createDayClosing);

dayClosingRouter.get("/", getDayClosings);
dayClosingRouter.get("/today", getTodayDayClosing);
dayClosingRouter.get("/:id", getDayClosingById);

export default dayClosingRouter;
