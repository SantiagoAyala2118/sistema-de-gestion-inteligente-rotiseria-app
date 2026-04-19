import { Request, Response } from "express";
import { loginService, registerService } from "../services/auth.service.js";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        msg: "email y password son requeridos",
      });
    }

    const result = await loginService(email, password);

    return res.status(200).json(result);
  } catch (err: any) {
    console.error("Error durante el login", err);
    if (err.statusCode === 500) {
      return res.status(500).json({
        ok: false,
        msg: "Error interno del servidor",
        error: err.message,
      });
    } else {
      return res.status(400).json({
        ok: false,
        msg: err.message,
      });
    }
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        ok: false,
        msg: "Todos los campos son obligatorios",
      });
    }

    const result = await registerService(nombre, email, password, rol);

    return res.status(201).json(result);
  } catch (err: any) {
    console.error("Error durante el registro", err);

    if (err.statusCode === 500) {
      return res.status(500).json({
        ok: false,
        msg: "Error interno del servidor",
        error: err.message,
      });
    } else {
      return res.status(400).json({
        ok: false,
        msg: err.message,
      });
    }
  }
};
