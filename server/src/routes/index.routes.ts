import { Router } from "express";
import authRouter from "./auth.routes";
import productRouter from "./producto.routes";
import categoryRouter from "./categoria.routes";
import inventoryRouter from "./inventario.routes";
import saleRouter from "./venta.routes";
import dashboardRouter from "./dashboard.routes";
import dayClosingRouter from "./cierre.routes";

const router = Router();

router.use("/auth", authRouter);

router.use("/products", productRouter);

router.use("/categories", categoryRouter);

router.use("/inventory", inventoryRouter);

router.use("/sales", saleRouter);

router.use("/dashboard", dashboardRouter);

router.use("/end-day", dayClosingRouter);

export default router;
