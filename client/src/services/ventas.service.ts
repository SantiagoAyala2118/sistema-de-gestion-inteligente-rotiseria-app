import api from "./api";

interface ItemVenta {
  productoId: number;
  cantidad: number;
}

interface Venta {
  id: number;
  total: number;
  medioDePago: string;
  creadoEn: string;
  detalles: {
    id: number;
    cantidad: number;
    precioUnitario: number;
    producto: { id: number; nombre: string };
  }[];
  usuario: { id: number; nombre: string };
}

export const createSale = async (
  items: ItemVenta[],
  medioDePago: string,
): Promise<Venta> => {
  const { data } = await api.post("/sales", { items, medioDePago });
  return data.data;
};

export const getTodaySales = async (): Promise<Venta[]> => {
  const { data } = await api.get("/sales/today");
  return data.data.ventas;
};
