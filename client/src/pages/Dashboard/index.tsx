import { useEffect, useState } from "react";
import { getDashboard } from "../../services/dashboard.service";
import type { MetricasDashboard } from "../../services/dashboard.service";

const mediosDePagoLabel: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  QR: "QR",
  TARJETA: "Tarjeta",
};

const Dashboard = () => {
  const [metricas, setMetricas] = useState<MetricasDashboard | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarDashboard = async () => {
    try {
      setCargando(true);
      const data = await getDashboard();
      setMetricas(data);
    } catch {
      setError("Error al cargar el dashboard");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, []);

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">Cargando dashboard...</p>
      </div>
    );
  }

  if (error || !metricas) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  const maxCantidad = metricas.rankingProductos[0]?.cantidad ?? 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <button
          onClick={cargarDashboard}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Actualizar
        </button>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Total vendido hoy",
            valor: `$${metricas.totalDeVentas.toLocaleString("es-AR")}`,
            sub: "ingresos del día",
            color: "text-gray-900",
          },
          {
            label: "Transacciones",
            valor: metricas.totalDeTransacciones,
            sub: "ventas registradas",
            color: "text-gray-900",
          },
          {
            label: "Ticket promedio",
            valor: `$${Math.round(metricas.ticketPromedio).toLocaleString("es-AR")}`,
            sub: "por transacción",
            color: "text-gray-900",
          },
          {
            label: "Alertas de stock",
            valor: metricas.alertasStock.length,
            sub:
              metricas.alertasStock.length === 0
                ? "todo en orden"
                : "productos por reponer",
            color:
              metricas.alertasStock.length > 0
                ? "text-red-500"
                : "text-emerald-600",
          },
        ].map((m) => (
          <div
            key={m.label}
            className="bg-white border border-gray-100 rounded-xl p-4"
          >
            <p className="text-xs text-gray-400 mb-1">{m.label}</p>
            <p className={`text-2xl font-semibold ${m.color}`}>{m.valor}</p>
            <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Fila del medio */}
      <div className="grid grid-cols-2 gap-4">
        {/* Ranking de productos */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Productos más vendidos hoy
            </h2>
            {metricas.productoEstrella && (
              <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full font-medium">
                ⭐ {metricas.productoEstrella.nombre}
              </span>
            )}
          </div>

          {metricas.rankingProductos.length === 0 ? (
            <p className="text-sm text-gray-300 text-center py-8">
              Sin ventas registradas hoy
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {metricas.rankingProductos.map((producto, index) => (
                <div key={producto.nombre} className="flex items-center gap-3">
                  <span className="text-xs text-gray-300 w-4 text-right">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700 w-36 truncate">
                    {producto.nombre}
                  </span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all"
                      style={{
                        width: `${(producto.cantidad / maxCantidad) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-6 text-right">
                    {producto.cantidad}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desglose por medio de pago */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Medios de pago
          </h2>

          {Object.keys(metricas.desgloseMedioDePago).length === 0 ? (
            <p className="text-sm text-gray-300 text-center py-8">
              Sin ventas registradas hoy
            </p>
          ) : (
            <div className="flex flex-col gap-0">
              {Object.entries(metricas.desgloseMedioDePago).map(
                ([medio, datos]) => (
                  <div
                    key={medio}
                    className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        {mediosDePagoLabel[medio] ?? medio}
                      </span>
                      <span className="text-xs text-gray-400">
                        {datos.cantidad} transacc.
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      ${datos.total.toLocaleString("es-AR")}
                    </span>
                  </div>
                ),
              )}
              <div className="flex items-center justify-between pt-3 mt-1">
                <span className="text-sm font-medium text-gray-900">Total</span>
                <span className="text-base font-semibold text-gray-900">
                  ${metricas.totalDeVentas.toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fila inferior */}
      <div className="grid grid-cols-2 gap-4">
        {/* Últimas ventas */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Últimas ventas
          </h2>

          {metricas.ultimasCincoVentas.length === 0 ? (
            <p className="text-sm text-gray-300 text-center py-8">
              Sin ventas registradas hoy
            </p>
          ) : (
            <div className="flex flex-col gap-0">
              {metricas.ultimasCincoVentas.map((venta) => (
                <div
                  key={venta.id}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm text-gray-800 truncate max-w-48">
                      {venta.productos}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(venta.creadoEn).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" · "}
                      {mediosDePagoLabel[venta.medioDePago] ??
                        venta.medioDePago}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ${venta.total.toLocaleString("es-AR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alertas de stock */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Alertas de stock
            {metricas.alertasStock.length > 0 && (
              <span className="ml-2 text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                {metricas.alertasStock.length}
              </span>
            )}
          </h2>

          {metricas.alertasStock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-1">
              <p className="text-sm text-emerald-500 font-medium">
                Todo en orden
              </p>
              <p className="text-xs text-gray-400">
                No hay productos con stock bajo
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {metricas.alertasStock.map((producto) => {
                const critico =
                  (producto.stock?.cantidad ?? 0) === 0 ||
                  (producto.stock?.cantidad ?? 0) <=
                    Math.floor((producto.stock?.umbralMinimo ?? 5) / 2);

                return (
                  <div
                    key={producto.id}
                    className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm text-gray-800">{producto.nombre}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {producto.categoria.nombre}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {producto.stock?.cantidad ?? 0} u.
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          critico
                            ? "bg-red-50 text-red-500"
                            : "bg-amber-50 text-amber-500"
                        }`}
                      >
                        {critico ? "Crítico" : "Bajo"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
