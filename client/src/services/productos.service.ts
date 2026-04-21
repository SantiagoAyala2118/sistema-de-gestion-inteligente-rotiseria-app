import api from "./api";
import type { Producto } from "../types";

export const getProductos = async (): Promise<Producto[]> => {
  const { data } = await api.get("/products");
  return data.data.productos;
};

export const getProductoById = async (id: number): Promise<Producto> => {
  const { data } = await api.get(`/products/${id}`);
  return data.data;
};

export const createProducto = async (body: {
  nombre: string;
  precioVenta: number;
  costoUnidad: number;
  categoriaId: number;
  stockInicial?: number;
  umbralMinimo?: number;
}): Promise<Producto> => {
  const { data } = await api.post("/products", body);
  return data.data;
};

export const updateProducto = async (
  id: number,
  body: Partial<{
    nombre: string;
    precioVenta: number;
    costoUnidad: number;
    categoriaId: number;
  }>,
): Promise<Producto> => {
  const { data } = await api.put(`/products/${id}`, body);
  return data.data;
};

export const deactivateProducto = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`);
};
