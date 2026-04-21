import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { verificarToken, soloAdmin } from "../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", verificarToken, soloAdmin, register);

export default authRouter;
