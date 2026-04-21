import { Request, Response } from "express";
import { obtenerCategorias } from "../services/categorias.service";

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categorias = await obtenerCategorias();

    if (categorias) {
      return res.status(200).json({
        ok: true,
        data: { categorias },
      });
    } else {
    }
  } catch (err: any) {
    console.error("Error obteniendo los productos", err);

    if (err.statusCode === 500) {
      return res.status(500).json({
        ok: false,
        message: "Error interno del servidor",
        error: err.message,
      });
    } else {
      return res.status(400).json({
        ok: false,
        message: err.message,
      });
    }
  }
};
