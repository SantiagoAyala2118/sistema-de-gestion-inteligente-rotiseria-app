import api from "./api";

export interface Cierre {
  id: number;
  fecha: string;
  totalVendido: number;
  totalTransacciones: number;
  efectivo: number;
  transferencia: number;
  qr: number;
  tarjeta: number;
  resumenJson: {
    rankingProductos: { nombre: string; cantidad: number }[];
  };
  creadoEn: string;
}

export const createDayClosing = async (): Promise<Cierre> => {
  const { data } = await api.post("/end-day");
  return data.data;
};

export const getDayClosing = async (): Promise<Cierre[]> => {
  const { data } = await api.get("/end-day");
  return data.data.cierres;
};

export const getTodayDayClosing = async (): Promise<Cierre | null> => {
  const { data } = await api.get("/end-day/today");
  return data.data;
};
