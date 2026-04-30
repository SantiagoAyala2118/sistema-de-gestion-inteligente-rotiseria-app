import { Router } from "express";
import {
  getInventory,
  getLowStock,
  replenishStock,
  updateThreshold,
} from "../controllers/inventory.controller";
import { soloAdmin, verificarToken } from "../middlewares/auth.middleware";

const inventoryRouter = Router();

inventoryRouter.use(verificarToken);

inventoryRouter.get("/", getInventory);
inventoryRouter.get("/stock-bajo", getLowStock);
inventoryRouter.patch("/:productoId/reponer", replenishStock);
inventoryRouter.patch("/:productoId/umbral", soloAdmin, updateThreshold);

export default inventoryRouter;
