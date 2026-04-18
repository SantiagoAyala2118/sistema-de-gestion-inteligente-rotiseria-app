import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthPayload, AuthRequest } from "../types";

export const verificarToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      msg: "Token de acceso no proporcionado",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as AuthPayload;
    req.userLogged = payload;
    next();
  } catch (er) {
    return res.status(401).json({
      msg: "Token invalido o expirado",
    });
  }
};

export const soloAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.userLogged?.rol !== "ADMINISTRADOR") {
    return res.status(403).json({
      msg: "No autorizado",
    });
  }
  next();
};
