import prisma from "../prisma/client";

//* INTERFACES PARA CREAR Y EDITAR PRODUCTOS
interface CrearProducto {
  nombre: string;
  precioVenta: number;
  costoUnidad: number;
  categoriaId: number;
  stockInicial?: number;
  umbralMinimo?: number;
}

interface EditarProducto {
  nombre?: string;
  precioVenta?: number;
  costoUnidad?: number;
  categoriaId?: number;
}

export const obtenerProductos = async () => {
  return prisma.producto.findMany({
    include: { categoria: true, stock: true },
    orderBy: { nombre: "asc" },
  });
};

export const obtenerProductoPorId = async (id: number) => {
  return prisma.producto.findUnique({
    where: { id },
    include: { categoria: true, stock: true },
  });
};

export const crearProducto = async (data: CrearProducto) => {
  return prisma.producto.create({
    data: {
      nombre: data.nombre,
      precioVenta: data.precioVenta,
      costoUnidad: data.costoUnidad,
      categoriaId: data.categoriaId,
      stock: {
        // Se crea el stock junto con el producto en una sola operación
        create: {
          cantidad: data.stockInicial ?? 0,
          umbralMinimo: data.umbralMinimo ?? 5,
        },
      },
    },
    include: { categoria: true, stock: true },
  });
};

export const editarProducto = async (id: number, data: EditarProducto) => {
  return prisma.producto.update({
    where: { id },
    data,
    include: { categoria: true, stock: true },
  });
};

export const desactivarProducto = async (id: number) => {
  // No se borra, solo desactivamos para conservar el historial
  return prisma.producto.update({
    where: { id },
    data: { activo: false },
  });
};
