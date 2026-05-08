import { obtenerMetricasDia } from "../services/dashboard.service";
import { Response, Request } from "express";

export const getMetrics = async (req: Request, res: Response) => {
  try {
    const metricas = await obtenerMetricasDia();

    return res.status(200).json({
      ok: true,
      data: metricas,
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
