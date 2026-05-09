import { Request, Response } from "express";
import {
  cerrarDia,
  obtenerCierreHoy,
  obtenerCierrePorId,
  obtenerCierres,
} from "../services/cierre.service";
import { RawQueryArgs } from "@prisma/client/runtime/library";

export const createDayClosing = async (req: Request, res: Response) => {
  try {
    const cierreDelDia = await cerrarDia();
    return res.status(201).json({
      ok: true,
      data: cierreDelDia,
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

export const getDayClosings = async (req: Request, res: Response) => {
  try {
    const cierresDelDia = await obtenerCierres();

    return res.status(200).json({
      ok: true,
      data: { cierresDelDia },
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

export const getDayClosingById = async (req: Request, res: Response) => {
  try {
    const cierre = await obtenerCierrePorId(Number(req.params.id));

    if (!cierre) {
      return res.status(404).json({ ok: false, msg: "Cierre no encontrado" });
    }

    return res.status(200).json({ ok: true, data: cierre });
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

export const getTodayDayClosing = async (req: Request, res: Response) => {
  try {
    const cierre = await obtenerCierreHoy();

    return res.status(200).json({
      ok: true,
      data: cierre,
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
