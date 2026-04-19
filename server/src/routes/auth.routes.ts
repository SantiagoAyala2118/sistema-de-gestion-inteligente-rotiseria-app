import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { verificarToken, soloAdmin } from "../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", verificarToken, soloAdmin, login);

export default authRouter;
