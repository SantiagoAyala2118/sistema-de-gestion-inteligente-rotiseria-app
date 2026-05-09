import prisma from "../prisma/client";

export const cerrarDia = async () => {
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

  //* En caso de que ya se haya cerrado el dia
  const cierreDiaExistente = await prisma.cierreDia.findFirst({
    where: { creadoEn: { gte: inicioDia, lte: finDia } },
  });

  if (cierreDiaExistente) {
    throw new Error("Ya existe un cierre registrado para el dia de hoy");
  }

  //* Se traen las ventas del dia
  const ventasDelDia = await prisma.venta.findMany({
    where: { creadoEn: { gte: inicioDia, lte: finDia } },
    include: { detalles: { include: { producto: true } } },
  });

  //* Totales
  const totalDeVentas = ventasDelDia.reduce(
    (acc, v) => acc + Number(v.total),
    0,
  );
  const totalDeTransacciones = ventasDelDia.length;

  //* Desglose por medio de pago
  const desglose = { EFECTIVO: 0, QR: 0, TRANSFERENCIA: 0, TARJETA: 0 };
  for (let venta of ventasDelDia) {
    desglose[venta.medioDePago] += Number(venta.total);
  }

  //* Conteo de productos
  const conteoProductos: Record<number, { nombre: string; cantidad: number }> =
    {};
  for (let venta of ventasDelDia) {
    for (let detalle of venta.detalles) {
      const id = detalle.productoId;
      if (!conteoProductos[id]) {
        conteoProductos[id] = { nombre: detalle.producto.nombre, cantidad: 0 };
      }
      conteoProductos[id].cantidad += detalle.cantidad;
    }
  }

  //* Ranking de productos
  const ranking = Object.values(conteoProductos)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  // Guardamos el cierre
  const cierre = await prisma.cierreDia.create({
    data: {
      fecha: hoy,
      totalVendido: totalDeVentas,
      totalTransacciones: totalDeTransacciones,
      efectivo: desglose.EFECTIVO,
      transferencia: desglose.TRANSFERENCIA,
      qr: desglose.QR,
      tarjeta: desglose.TARJETA,
      resumenJson: {
        ranking,
      },
    },
  });
};

export const obtenerCierres = async () => {
  return prisma.cierreDia.findMany({
    orderBy: { creadoEn: "desc" },
  });
};

export const obtenerCierrePorDia = async (id: number) => {
  return prisma.cierreDia.findUnique({
    where: { id },
  });
};

export const obtenerCierreHoy = async () => {
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

  return prisma.cierreDia.findFirst({
    where: { fecha: { gte: inicioDia, lte: finDia } },
  });
};
