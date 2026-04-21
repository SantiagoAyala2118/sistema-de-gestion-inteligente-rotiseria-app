import prisma from "../prisma/client";

export const obtenerCategorias = async () => {
  return prisma.categoria.findMany({ orderBy: { nombre: "asc" } });
};
