import { useEffect, useState } from "react";
import type { Cierre } from "../../services/cierre.service";
import {
  getTodayDayClosing,
  createDayClosing,
} from "../../services/cierre.service";
import { getDashboard } from "../../services/dashboard.service";
import type { MetricasDashboard } from "../../services/dashboard.service";

const mediosDePagoLabel: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  QR: "QR",
  TARJETA: "Tarjeta",
};

const CierreDia = () => {
  const [cierre, setCierre] = useState<Cierre | null>(null);
  const [metricas, setMetricas] = useState<MetricasDashboard | null>(null);
  const [cargando, setCargando] = useState(true);
  const [ejecutando, setEjecutando] = useState(false);
  const [cajaReal, setCajaReal] = useState("");
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [cierreHoy, metricasHoy] = await Promise.all([
        getTodayDayClosing(),
        getDashboard(),
      ]);
      setCierre(cierreHoy);
      setMetricas(metricasHoy);
    } catch {
      setError("Error al cargar los datos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCierre = async () => {
    if (
      !confirm(
        "¿Estás seguro de cerrar el día? Esta acción no se puede deshacer.",
      )
    )
      return;
    setEjecutando(true);
    setError("");
    try {
      const nuevoCierre = await createDayClosing();
      setCierre(nuevoCierre);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al ejecutar el cierre");
    } finally {
      setEjecutando(false);
    }
  };

  // Calculamos la diferencia entre caja real y caja del sistema
  const diferencia = cajaReal
    ? Number(cajaReal) - (metricas?.totalDeVentas ?? 0)
    : null;

  const diferenciaColor =
    diferencia === null
      ? "text-gray-400"
      : diferencia === 0
        ? "text-emerald-600"
        : Math.abs(diferencia) <= 2000
          ? "text-amber-500"
          : "text-red-500";

  const diferenciaLabel =
    diferencia === null
      ? "Ingresá el monto para verificar"
      : diferencia === 0
        ? "Caja exacta, sin diferencias"
        : diferencia > 0
          ? `Sobran $${diferencia.toLocaleString("es-AR")}`
          : `Faltan $${Math.abs(diferencia).toLocaleString("es-AR")}`;

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Cierre del día</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {new Date().toLocaleDateString("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Banner si ya está cerrado */}
      {cierre && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <span className="text-emerald-500 text-lg">✓</span>
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Día cerrado correctamente
            </p>
            <p className="text-xs text-emerald-500 mt-0.5">
              Cierre ejecutado a las{" "}
              {new Date(cierre.creadoEn).toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Resumen del día */}
        <div className="flex flex-col gap-4">
          {/* Métricas */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Resumen del día
            </h2>
            <div className="flex flex-col gap-0">
              {[
                {
                  label: "Total vendido",
                  valor: `$${(cierre?.totalVendido ?? metricas?.totalDeVentas ?? 0).toLocaleString("es-AR")}`,
                  bold: true,
                },
                {
                  label: "Transacciones",
                  valor:
                    cierre?.totalTransacciones ??
                    metricas?.totalDeTransacciones ??
                    0,
                  bold: false,
                },
                {
                  label: "Ticket promedio",
                  valor: `$${Math.round(metricas?.ticketPromedio ?? 0).toLocaleString("es-AR")}`,
                  bold: false,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span
                    className={`text-sm ${item.bold ? "font-semibold text-gray-900 text-base" : "font-medium text-gray-700"}`}
                  >
                    {item.valor}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Desglose por medio de pago */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Medios de pago
            </h2>
            <div className="flex flex-col gap-0">
              {(["EFECTIVO", "TRANSFERENCIA", "QR", "TARJETA"] as const).map(
                (medio) => {
                  const valor = cierre
                    ? Number(cierre[medio.toLowerCase() as keyof Cierre])
                    : (metricas?.desgloseMedioDePago[medio]?.total ?? 0);
                  const cantidad =
                    metricas?.desgloseMedioDePago[medio]?.cantidad ?? 0;

                  return (
                    <div
                      key={medio}
                      className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">
                          {mediosDePagoLabel[medio]}
                        </span>
                        {!cierre && cantidad > 0 && (
                          <span className="text-xs text-gray-400">
                            {cantidad} transacc.
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        ${valor.toLocaleString("es-AR")}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col gap-4">
          {/* Ranking de productos */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Top productos del día
            </h2>
            {(() => {
              const ranking = cierre
                ? (cierre.resumenJson as any).ranking
                : (metricas?.rankingProductos ?? []);

              return ranking.length === 0 ? (
                <p className="text-sm text-gray-300 text-center py-6">
                  Sin ventas registradas
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {ranking.map(
                    (p: { nombre: string; cantidad: number }, i: number) => (
                      <div key={p.nombre} className="flex items-center gap-3">
                        <span className="text-xs text-gray-300 w-4 text-right">
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-700 flex-1 truncate">
                          {p.nombre}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {p.cantidad}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              );
            })()}
          </div>

          {/* Verificación de caja — solo si no está cerrado */}
          {!cierre && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Verificación de caja
              </h2>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    Total registrado por el sistema
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    ${(metricas?.totalDeVentas ?? 0).toLocaleString("es-AR")}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">
                    Total contado en caja
                  </label>
                  <input
                    type="number"
                    value={cajaReal}
                    onChange={(e) => setCajaReal(e.target.value)}
                    placeholder="Ingresá el monto real"
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-emerald-400"
                  />
                </div>
                <p className={`text-sm font-medium ${diferenciaColor}`}>
                  {diferenciaLabel}
                </p>
              </div>
            </div>
          )}

          {/* Botón de cierre — solo si no está cerrado */}
          {!cierre && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                Al cerrar el día el sistema guarda el resumen permanentemente y
                no se podrán agregar más ventas a esta fecha.
              </p>

              {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

              <button
                onClick={handleCierre}
                disabled={ejecutando}
                className="w-full py-3 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {ejecutando ? "Cerrando..." : "Cerrar el día"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CierreDia;
