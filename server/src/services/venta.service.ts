import prisma from "../prisma/client";

interface ItenVenta {
  productoId: number;
  cantidad: number;
}

export const crearVenta = async (
  items: ItenVenta[],
  medioDePago: "EFECTIVO" | "TRANSFERENCIA" | "QR" | "TARJETA",
  usuarioId: number,
) => {
  console.log("Items recibidos", JSON.stringify(items));
  console.log(
    "IDs a buscar",
    items.map((item) => item.productoId),
  );

  //* Se traen los productos asociados a la venta
  const productos = await prisma.producto.findMany({
    where: { id: { in: items.map((item) => item.productoId) } },
    include: { stock: true },
  });

  console.log(
    "Items encontrados",
    JSON.stringify(productos.map((p) => p.nombre)),
  );
  console.log("Cantidad de productos encontrados", productos.length);

  //* Se verifica que haya stock suficiente en el inventario
  for (const item of items) {
    const producto = productos.find(
      (p) => Number(p.id) === Number(item.productoId),
    );

    if (!producto) {
      throw new Error(
        `El producto con el id ${item.productoId} no se ha encontrado`,
      );
    }

    if (!producto.activo) {
      throw new Error(`El producto ${producto.nombre} no esta disponible`);
    }

    const stockDisponible = producto.stock?.cantidad ?? 0;
    if (stockDisponible < item.cantidad) {
      throw new Error(
        `Stock insuficiente para ${producto.nombre}. Cantidad dispobible: ${stockDisponible}`,
      );
    }
  }

  //* Se calcula el total de la venta
  const total = items.reduce((acc, item) => {
    const producto = productos.find(
      (p) => Number(p.id) === Number(item.productoId),
    )!;
    return acc + Number(producto?.precioVenta) * item.cantidad;
  }, 0);

  //* Transaccion de la operacion
  return prisma.$transaction(async (tx) => {
    //? Venta
    const venta = await tx.venta.create({
      data: {
        total,
        medioDePago,
        usuarioId,
        detalles: {
          create: items.map((item) => {
            const producto = productos.find(
              (p) => Number(p.id) === Number(item.productoId),
            )!;
            return {
              productoId: item.productoId,
              cantidad: item.cantidad,
              precioUnitario: producto.precioVenta,
            };
          }),
        },
      },
      include: {
        detalles: {
          include: { producto: true },
        },
      },
    });
    //* Descuento del stock
    for (const item of items) {
      const producto = productos.find(
        (p) => Number(p.id) === Number(item.productoId),
      )!;

      await tx.stock.update({
        where: { productoId: producto.id },
        data: { cantidad: { decrement: item.cantidad } },
      });

      //* Se registra el movimiento
      await tx.movimientoStock.create({
        data: {
          tipo: "VENTA",
          cantidad: item.cantidad,
          stockId: producto.stock!.id,
          ventaId: venta.id,
        },
      });
    }

    return venta;
  });
};

export const obtenerVentas = async () => {
  return prisma.venta.findMany({
    orderBy: { creadoEn: "desc" },
    include: {
      detalles: { include: { producto: true } },
      usuario: {
        select: { id: true, nombre: true },
      },
    },
  });
};

export const obtenerVentasDelDia = async () => {
  const hoy = new Date();
  const inicioDia = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate(),
    0,
    0,
    0,
  );
  const finDia = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate(),
    23,
    59,
    59,
  );

  return prisma.venta.findMany({
    where: {
      creadoEn: { gte: inicioDia, lte: finDia },
    },
    orderBy: {
      creadoEn: "desc",
    },
    include: {
      detalles: {
        include: { producto: true },
      },
      usuario: {
        select: { id: true, nombre: true },
      },
    },
  });
};
