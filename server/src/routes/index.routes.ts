import { Router } from "express";
import authRouter from "./auth.routes";
import productRouter from "./producto.routes";
import categoryRouter from "./categoria.routes";

const router = Router();

router.use("/auth", authRouter);

router.use("/products", productRouter);

router.use("/categories", productRouter);

export default router;
