import { useEffect, useState } from "react";
import type { Producto, Categoria } from "../types";
import {
  getProductos,
  createProducto,
  updateProducto,
  deactivateProducto,
} from "../services/productos.service";
import { getCategories } from "../services/categorias.service";

const initialForm = {
  nombre: "",
  precioVenta: "",
  costoUnidad: "",
  categoriaId: "",
  stockInicial: "",
  umbralMinimo: "",
};

const Productos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(
    null,
  );
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = async () => {
    try {
      const [prods, cats] = await Promise.all([
        getProductos(),
        getCategories(),
      ]);
      setProductos(prods);
      setCategorias(cats);
    } catch {
      setError("Error al cargar los datos");
    } finally {
      setCargando(false);
    }
  };

  // Se cargan los datos cuando el componente monta
  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirModalCrear = () => {
    setProductoEditando(null);
    setForm(initialForm);
    setError("");
    setModalAbierto(true);
  };

  const abrirModalEditar = (producto: Producto) => {
    setProductoEditando(producto);
    setForm({
      nombre: producto.nombre,
      precioVenta: String(producto.precioVenta),
      costoUnidad: String(producto.costoUnidad),
      categoriaId: String(producto.categoriaId),
      stockInicial: "",
      umbralMinimo: String(producto.stock?.umbralMinimo ?? 5),
    });
    setError("");
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoEditando(null);
    setForm(initialForm);
    setError("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    try {
      if (productoEditando) {
        // Editar producto existente
        await updateProducto(productoEditando.id, {
          nombre: form.nombre,
          precioVenta: Number(form.precioVenta),
          costoUnidad: Number(form.costoUnidad),
          categoriaId: Number(form.categoriaId),
        });
      } else {
        // Crear producto nuevo
        await createProducto({
          nombre: form.nombre,
          precioVenta: Number(form.precioVenta),
          costoUnidad: Number(form.costoUnidad),
          categoriaId: Number(form.categoriaId),
          stockInicial: form.stockInicial ? Number(form.stockInicial) : 0,
          umbralMinimo: form.umbralMinimo ? Number(form.umbralMinimo) : 5,
        });
      }

      await cargarDatos();
      cerrarModal();
    } catch {
      setError("Error al guardar el producto");
    } finally {
      setGuardando(false);
    }
  };

  const handleDesactivar = async (id: number) => {
    if (!confirm("¿Desactivar este producto?")) return;
    try {
      await deactivateProducto(id);
      await cargarDatos();
    } catch {
      setError("Error al desactivar el producto");
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header de la página */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Administrá el catálogo de productos
          </p>
        </div>
        <button
          onClick={abrirModalCrear}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          + Nuevo producto
        </button>
      </div>

      {/* Tabla de productos */}
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
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">
                Precio venta
              </th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">
                Costo
              </th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">
                Stock
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
            {productos.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center text-sm text-gray-400 py-12"
                >
                  No hay productos cargados todavía
                </td>
              </tr>
            ) : (
              productos.map((producto) => {
                const stockBajo = producto.stock
                  ? producto.stock.cantidad <= producto.stock.umbralMinimo
                  : false;

                return (
                  <tr
                    key={producto.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {producto.nombre}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {producto.categoria.nombre}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      ${Number(producto.precioVenta).toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      ${Number(producto.costoUnidad).toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={
                          stockBajo
                            ? "text-red-500 font-medium"
                            : "text-gray-700"
                        }
                      >
                        {producto.stock?.cantidad ?? 0}
                      </span>
                      <span className="text-gray-400 text-xs ml-1">
                        / mín {producto.stock?.umbralMinimo ?? 5}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          producto.activo
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {producto.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirModalEditar(producto)}
                          className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer transition-colors"
                        >
                          Editar
                        </button>
                        {producto.activo && (
                          <button
                            onClick={() => handleDesactivar(producto.id)}
                            className="text-xs text-red-400 hover:text-red-600 cursor-pointer transition-colors"
                          >
                            Desactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal crear / editar */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <h2 className="text-base font-semibold text-gray-900 mb-5">
              {productoEditando ? "Editar producto" : "Nuevo producto"}
            </h2>

            <form onSubmit={handleGuardar} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Nombre
                </label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Empanada de carne"
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">
                    Precio de venta
                  </label>
                  <input
                    name="precioVenta"
                    type="number"
                    value={form.precioVenta}
                    onChange={handleChange}
                    required
                    placeholder="Ej: 1200"
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">
                    Costo unitario
                  </label>
                  <input
                    name="costoUnidad"
                    type="number"
                    value={form.costoUnidad}
                    onChange={handleChange}
                    required
                    placeholder="Ej: 600"
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Categoría
                </label>
                <select
                  name="categoriaId"
                  value={form.categoriaId}
                  onChange={handleChange}
                  required
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="">Seleccioná una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campos de stock solo al crear */}
              {!productoEditando && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-600">
                      Stock inicial
                    </label>
                    <input
                      name="stockInicial"
                      type="number"
                      value={form.stockInicial}
                      onChange={handleChange}
                      placeholder="Ej: 20"
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-600">
                      Stock mínimo
                    </label>
                    <input
                      name="umbralMinimo"
                      type="number"
                      value={form.umbralMinimo}
                      onChange={handleChange}
                      placeholder="Ej: 5"
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-3 mt-2">
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
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productos;
