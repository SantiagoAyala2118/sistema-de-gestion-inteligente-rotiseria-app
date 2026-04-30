import prisma from "../prisma/client";

export const obtenerInventario = async () => {
  return prisma.producto.findMany({
    where: { activo: true },
    include: {
      categoria: true,
      stock: true,
    },
    orderBy: { nombre: "asc" },
  });
};

export const obtenerStockBajo = async () => {
  return prisma.producto.findMany({
    where: {
      activo: true,
      stock: {
        cantidad: {
          lte: prisma.stock.fields.umbralMinimo,
        },
      },
    },
    include: {
      categoria: true,
      stock: true,
    },
  });
};

export const reponerStock = async (
  productoId: number,
  cantidad: number,
  nota?: string,
) => {
  const stock = await prisma.stock.findUnique({ where: { productoId } });

  if (!stock) throw new Error("Stock no encontrado para este producto");
  if (cantidad < 0) throw new Error("La cantidad debe ser mayor que 0 (cero)");

  return prisma.$transaction(async (tx) => {
    const stockActualizado = await tx.stock.update({
      where: { productoId },
      data: { cantidad: { increment: cantidad } },
    });
    await tx.movimientoStock.create({
      data: {
        tipo: "REPOSICION",
        cantidad,
        nota: nota ?? null,
        stockId: stock.id,
      },
    });

    return stockActualizado;
  });
};

export const actualizarUmbral = async (
  productoId: number,
  umbralMinimo: number,
) => {
  if (umbralMinimo < 0) throw new Error("El umbral no puede ser negativo");

  return prisma.stock.update({
    where: { productoId },
    data: { umbralMinimo },
  });
};
