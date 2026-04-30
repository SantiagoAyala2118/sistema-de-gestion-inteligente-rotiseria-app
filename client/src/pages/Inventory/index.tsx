import { useEffect, useState } from "react";
import type { Producto } from "../../types";
import {
  getInventario,
  reponerStock,
  actualizarUmbral,
} from "../../services/inventario.service";

type Filtro = "todos" | "alertas";
type ModalTipo = "reponer" | "umbral" | null;

interface ModalState {
  tipo: ModalTipo;
  producto: Producto | null;
}

const Inventario = () => {
  const [inventario, setInventario] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState<ModalState>({
    tipo: null,
    producto: null,
  });
  const [cantidad, setCantidad] = useState("");
  const [nota, setNota] = useState("");
  const [nuevoUmbral, setNuevoUmbral] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cargarInventario = async () => {
    try {
      const data = await getInventario();
      setInventario(data);
    } catch {
      setError("Error al cargar el inventario");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  // Lógica del estado del stock
  const getEstado = (producto: Producto) => {
    if (!producto.stock) return "sin-stock";
    const { cantidad, umbralMinimo } = producto.stock;
    if (cantidad === 0) return "critico";
    if (cantidad <= umbralMinimo) return "bajo";
    return "normal";
  };

  // Filtramos en memoria, sin llamadas extra al backend
  const productosFiltrados = inventario.filter((p) => {
    const matchBusqueda = p.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    const matchFiltro = filtro === "todos" || getEstado(p) !== "normal";
    return matchBusqueda && matchFiltro;
  });

  const cantidadAlertas = inventario.filter(
    (p) => getEstado(p) !== "normal",
  ).length;

  const abrirModalReponer = (producto: Producto) => {
    setModal({ tipo: "reponer", producto });
    setCantidad("");
    setNota("");
    setError("");
  };

  const abrirModalUmbral = (producto: Producto) => {
    setModal({ tipo: "umbral", producto });
    setNuevoUmbral(String(producto.stock?.umbralMinimo ?? 5));
    setError("");
  };

  const cerrarModal = () => {
    setModal({ tipo: null, producto: null });
    setCantidad("");
    setNota("");
    setNuevoUmbral("");
    setError("");
  };

  const handleReponer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.producto) return;
    setGuardando(true);
    try {
      await reponerStock(
        modal.producto.id,
        Number(cantidad),
        nota || undefined,
      );
      await cargarInventario();
      cerrarModal();
    } catch {
      setError("Error al reponer el stock");
    } finally {
      setGuardando(false);
    }
  };

  const handleUmbral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.producto) return;
    setGuardando(true);
    try {
      await actualizarUmbral(modal.producto.id, Number(nuevoUmbral));
      await cargarInventario();
      cerrarModal();
    } catch {
      setError("Error al actualizar el umbral");
    } finally {
      setGuardando(false);
    }
  };

  // Colores según el estado del stock
  const estadoConfig = {
    normal: {
      badge: "bg-emerald-50 text-emerald-600",
      barra: "bg-emerald-400",
      label: "Normal",
    },
    bajo: {
      badge: "bg-amber-50 text-amber-600",
      barra: "bg-amber-400",
      label: "Bajo",
    },
    critico: {
      badge: "bg-red-50 text-red-500",
      barra: "bg-red-400",
      label: "Crítico",
    },
    "sin-stock": {
      badge: "bg-gray-100 text-gray-400",
      barra: "bg-gray-300",
      label: "Sin stock",
    },
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Inventario</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Estado actual del stock — {inventario.length} productos
        </p>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total productos",
            valor: inventario.length,
            color: "text-gray-900",
          },
          {
            label: "En estado normal",
            valor: inventario.filter((p) => getEstado(p) === "normal").length,
            color: "text-emerald-600",
          },
          {
            label: "Stock bajo",
            valor: inventario.filter((p) => getEstado(p) === "bajo").length,
            color: "text-amber-500",
          },
          {
            label: "Stock crítico",
            valor: inventario.filter((p) => getEstado(p) === "critico").length,
            color: "text-red-500",
          },
        ].map((m) => (
          <div
            key={m.label}
            className="bg-white border border-gray-100 rounded-xl p-4"
          >
            <p className="text-xs text-gray-400 mb-1">{m.label}</p>
            <p className={`text-2xl font-semibold ${m.color}`}>{m.valor}</p>
          </div>
        ))}
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-emerald-400"
        />
        <button
          onClick={() => setFiltro("todos")}
          className={`px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
            filtro === "todos"
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltro("alertas")}
          className={`px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            filtro === "alertas"
              ? "bg-red-500 text-white"
              : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
        >
          Solo alertas
          {cantidadAlertas > 0 && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                filtro === "alertas"
                  ? "bg-white text-red-500"
                  : "bg-red-100 text-red-500"
              }`}
            >
              {cantidadAlertas}
            </span>
          )}
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">
                Producto
              </th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">
                Categoría
              </th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3 w-48">
                Stock
              </th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">
                Mínimo
              </th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">
                Estado
              </th>
              <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-sm text-gray-400 py-12"
                >
                  {filtro === "alertas"
                    ? "No hay alertas de stock activas"
                    : "No se encontraron productos"}
                </td>
              </tr>
            ) : (
              productosFiltrados.map((producto) => {
                const estado = getEstado(producto);
                const config = estadoConfig[estado];
                const stockActual = producto.stock?.cantidad ?? 0;
                const umbral = producto.stock?.umbralMinimo ?? 5;
                const porcentaje = Math.min(
                  100,
                  Math.round((stockActual / Math.max(umbral * 2, 1)) * 100),
                );

                return (
                  <tr
                    key={producto.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {producto.nombre}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                        {producto.categoria.nombre}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${config.barra}`}
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                        <span
                          className={`text-sm font-medium min-w-6 text-right ${
                            estado === "critico"
                              ? "text-red-500"
                              : estado === "bajo"
                                ? "text-amber-500"
                                : "text-gray-700"
                          }`}
                        >
                          {stockActual}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {umbral}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${config.badge}`}
                      >
                        {config.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => abrirModalReponer(producto)}
                          className="text-xs text-emerald-500 hover:text-emerald-700 cursor-pointer transition-colors font-medium"
                        >
                          Reponer
                        </button>
                        <button
                          onClick={() => abrirModalUmbral(producto)}
                          className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                        >
                          Umbral
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal reponer stock */}
      {modal.tipo === "reponer" && modal.producto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              Reponer stock
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              {modal.producto.nombre}
            </p>

            <form onSubmit={handleReponer} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Cantidad a agregar
                </label>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  required
                  min="1"
                  placeholder="Ej: 20"
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Nota{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Ej: Entrega proveedor lunes"
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-200 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {guardando ? "Reponiendo..." : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal umbral */}
      {modal.tipo === "umbral" && modal.producto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              Actualizar umbral mínimo
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              {modal.producto.nombre}
            </p>

            <form onSubmit={handleUmbral} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Nuevo umbral mínimo
                </label>
                <input
                  type="number"
                  value={nuevoUmbral}
                  onChange={(e) => setNuevoUmbral(e.target.value)}
                  required
                  min="0"
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  El sistema alertará cuando el stock baje de este número
                </p>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 py-2.5 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-200 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {guardando ? "Guardando..." : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;
