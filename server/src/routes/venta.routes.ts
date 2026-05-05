import { Router } from "express";
import { verificarToken, soloAdmin } from "../middlewares/auth.middleware";
import {
  createSale,
  getDaySales,
  getSales,
} from "../controllers/sale.controller";

const saleRouter = Router();

saleRouter.use(verificarToken);

saleRouter.post("/", createSale);
saleRouter.get("/", getSales);
saleRouter.get("/today", getDaySales);

export default saleRouter;
