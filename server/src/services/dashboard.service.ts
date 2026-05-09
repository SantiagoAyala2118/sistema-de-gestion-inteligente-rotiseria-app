import prisma from "../prisma/client";

export const obtenerMetricasDia = async () => {
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

  //* Ventas del dia
  const ventasDelDia = await prisma.venta.findMany({
    where: {
      creadoEn: {
        gte: inicioDia,
        lte: finDia,
      },
    },
    include: {
      detalles: { include: { producto: true } },
    },
    orderBy: { creadoEn: "desc" },
  });

  //* Total vendido y total de transacciones
  const totalDeVentas = ventasDelDia.reduce(
    (acc, v) => acc + Number(v.total),
    0,
  );
  const totalDeTransacciones = ventasDelDia.length;

  //* Ticket promedio
  const ticketPromedio =
    totalDeTransacciones > 0 ? totalDeVentas / totalDeTransacciones : 0;

  //* Desglose por medio de pago
  const desgloseMedioDePago = ventasDelDia.reduce(
    (acc: any, venta) => {
      const medio = venta.medioDePago;
      if (!acc[medio]) acc[medio] = { total: 0, cantidad: 0 };
      acc[medio].total = +Number(venta.total);
      acc[medio].cantidad = +1;

      return acc;
    },
    {} as Record<string, { total: Number; cantidad: number }>,
  );

  //* Ranking del producto mas vendido del dia
  const conteoProductos: Record<number, { nombre: string; cantidad: number }> =
    {};

  for (let venta of ventasDelDia) {
    for (let detalle of venta.detalles) {
      const id = detalle.id;
      if (!conteoProductos[id]) {
        conteoProductos[id] = { nombre: detalle.producto.nombre, cantidad: 0 };
      }
      conteoProductos[id].cantidad = detalle.cantidad;
    }
  }

  const rankingProductos = Object.values(conteoProductos)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  //* Producto estrella
  const productoEstrella = rankingProductos[0] ?? null;

  //* Alertas de stock bajo
  const alertasStock = await prisma.producto.findMany({
    where: {
      activo: true,
      stock: { cantidad: { lte: prisma.stock.fields.umbralMinimo } },
    },
    include: {
      stock: true,
      categoria: true,
    },
    orderBy: { nombre: "asc" },
  });

  //* Ultimas 5 ventas
  const ultimasCincoVentas = ventasDelDia.slice(0, 5).map((v) => ({
    id: v.id,
    total: Number(v.total),
    medioDePago: v.medioDePago,
    creadoEn: v.creadoEn,
    productos: v.detalles
      .map((p) => `${p.cantidad}x ${p.producto.nombre}`)
      .join(", "),
  }));

  return {
    totalDeVentas,
    totalDeTransacciones,
    ticketPromedio,
    desgloseMedioDePago,
    rankingProductos,
    productoEstrella,
    alertasStock,
    ultimasCincoVentas,
  };
};
