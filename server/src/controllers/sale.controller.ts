import { Response } from "express";
import { AuthRequest } from "../types";
import {
  crearVenta,
  obtenerVentas,
  obtenerVentasDelDia,
} from "../services/venta.service";

export const createSale = async (req: AuthRequest, res: Response) => {
  try {
    const { items, medioDePago } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "La venta debe tener al menos un producto",
      });
    }

    if (!medioDePago) {
      return res.status(400).json({
        ok: false,
        msg: "El medio de pago es requerido",
      });
    }

    const usuarioId = req.userLogged!.id;

    const venta = await crearVenta(items, medioDePago, usuarioId);

    return res.status(201).json({
      ok: true,
      data: venta,
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

export const getSales = async (req: AuthRequest, res: Response) => {
  try {
    const ventas = await obtenerVentas();

    return res.status(200).json({
      ok: true,
      data: { ventas },
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

export const getDaySales = async (req: AuthRequest, res: Response) => {
  try {
    const ventasDelDia = await obtenerVentasDelDia();

    return res.status(200).json({
      ok: true,
      data: { ventasDelDia },
    });
  } catch (err: any) {
    console.error("Error: ", err);
    if (err.statusCode === 500) {
      return res.status(400).json({
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
