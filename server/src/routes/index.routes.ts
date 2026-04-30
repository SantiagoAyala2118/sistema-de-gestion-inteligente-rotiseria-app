import { Router } from "express";
import authRouter from "./auth.routes";
import productRouter from "./producto.routes";
import categoryRouter from "./categoria.routes";
import inventoryRouter from "./inventario.routes";

const router = Router();

router.use("/auth", authRouter);

router.use("/products", productRouter);

router.use("/categories", categoryRouter);

router.use("/inventory", inventoryRouter);

export default router;
