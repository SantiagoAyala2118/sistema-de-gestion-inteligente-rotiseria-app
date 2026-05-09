import api from "./api";

export interface MetricasDashboard {
  totalDeVentas: number;
  totalDeTransacciones: number;
  ticketPromedio: number;
  desgloseMedioDePago: Record<string, { total: number; cantidad: number }>;
  rankingProductos: { nombre: string; cantidad: number }[];
  productoEstrella: { nombre: string; cantidad: number } | null;
  alertasStock: {
    id: number;
    nombre: string;
    categoria: { nombre: string };
    stock: { cantidad: number; umbralMinimo: number } | null;
  }[];
  ultimasCincoVentas: {
    id: number;
    total: number;
    medioDePago: string;
    creadoEn: string;
    productos: string;
  }[];
}

export const getDashboard = async (): Promise<MetricasDashboard> => {
  const { data } = await api.get("/dashboard");
  return data.data;
};
