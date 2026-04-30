import { Request, Response } from "express";
import {
  obtenerInventario,
  obtenerStockBajo,
  reponerStock,
  actualizarUmbral,
} from "../services/inventario.service";

export const getInventory = async (req: Request, res: Response) => {
  try {
    const inventory = await obtenerInventario();

    return res.status(200).json({
      ok: true,
      data: { inventory },
    });
  } catch (err: any) {
    console.error("Error: ", err);
    if (err.statusCode === 500) {
      return res.status(500).json({
        ok: false,
        msg: "Error interno del servidor",
      });
    } else {
      return res.status(400).json({
        ok: false,
        msg: err.message,
      });
    }
  }
};

export const getLowStock = async (req: Request, res: Response) => {
  try {
    const lowInventoy = await obtenerStockBajo();

    return res.status(200).json({
      ok: true,
      data: { lowInventoy },
    });
  } catch (err: any) {
    console.error("Error: ", err);
    if (err.statusCode === 500) {
      return res.status(500).json({
        ok: false,
        msg: "Error interno del servidor",
      });
    } else {
      return res.status(400).json({
        ok: false,
        msg: err.message,
      });
    }
  }
};

export const replenishStock = async (req: Request, res: Response) => {
  try {
    const { cantidad, nota } = req.body;
    const productoId = Number(req.params.productoId);

    if (!cantidad || isNaN(productoId)) {
      return res.status(400).json({
        ok: false,
        msg: "Datos invalidos",
      });
    }

    const stock = await reponerStock(productoId, Number(cantidad), nota);

    return res.status(200).json({
      ok: true,
      data: { stock },
    });
  } catch (err: any) {
    console.error("Error: ", err);
    if (err.statusCode === 500) {
      return res.status(500).json({
        ok: false,
        msg: "Error interno del servidor",
      });
    } else {
      return res.status(400).json({
        ok: false,
        msg: err.message,
      });
    }
  }
};

export const updateThreshold = async (req: Request, res: Response) => {
  try {
    const { umbralMinimo } = req.body;
    const productoId = Number(req.params.productoId);

    const nuevoUmbral = await actualizarUmbral(productoId, umbralMinimo);

    return res.status(200).json({
      ok: true,
      data: { nuevoUmbral },
    });
  } catch (err: any) {
    console.error("Error: ", err);

    if (err.statusCode === 500) {
      return res.status(500).json({
        ok: false,
        msg: "Error interno del servidor",
      });
    } else {
      return res.status(400).json({
        ok: false,
        msg: err.message,
      });
    }
  }
};
