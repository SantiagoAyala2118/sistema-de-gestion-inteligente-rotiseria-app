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
inventoryRouter.get("/low-stock", getLowStock);
inventoryRouter.patch("/:productoId/replenish", replenishStock);
inventoryRouter.patch("/:productoId/threshold", soloAdmin, updateThreshold);

export default inventoryRouter;
