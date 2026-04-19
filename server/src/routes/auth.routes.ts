import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { verificarToken, soloAdmin } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", verificarToken, soloAdmin, login);

export default authRouter;
