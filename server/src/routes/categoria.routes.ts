import { Router } from "express";
import { getCategories } from "../controllers/categories.controller";
import { verificarToken } from "../middlewares/auth.middleware";

const categoryRouter = Router();

categoryRouter.use(verificarToken);
categoryRouter.get("/", getCategories);

export default categoryRouter;
