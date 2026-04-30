import api from "./api";
import type { Producto } from "../types";

export const getInventario = async (): Promise<Producto[]> => {
  const { data } = await api.get("/inventory");
  return data.data.inventario;
};

export const getStockBajo = async (): Promise<Producto[]> => {
  const { data } = await api.get("/inventory/low-stock");
  return data.data.productos;
};

export const reponerStock = async (
  productoId: number,
  cantidad: number,
  nota?: string,
): Promise<void> => {
  await api.patch(`/inventory/${productoId}/replenish`, { cantidad, nota });
};

export const actualizarUmbral = async (
  productoId: number,
  umbralMinimo: number,
): Promise<void> => {
  await api.patch(`/inventory/${productoId}/threshold`, { umbralMinimo });
};
