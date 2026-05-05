import { useEffect, useState } from "react";
import type { Producto } from "../../types";
import { getProductos } from "../../services/productos.service";
import { createSale } from "../../services/ventas.service";

type MedioDePago = "EFECTIVO" | "TRANSFERENCIA" | "QR" | "TARJETA";

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

interface Carrito {
  [productoId: number]: ItemCarrito;
}

const mediosDePago: { valor: MedioDePago; label: string }[] = [
  { valor: "EFECTIVO", label: "Efectivo" },
  { valor: "TRANSFERENCIA", label: "Transferencia" },
  { valor: "QR", label: "QR" },
  { valor: "TARJETA", label: "Tarjeta" },
];

const Ventas = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [carrito, setCarrito] = useState<Carrito>({});
  const [medioDePago, setMedioDePago] = useState<MedioDePago | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  const cargarProductos = async () => {
    try {
      const data = await getProductos();
      // Solo mostramos productos activos con stock disponible
      setProductos(data.filter((p) => p.activo));
    } catch {
      setError("Error al cargar los productos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // Categorías únicas extraídas de los productos
  const categorias = [
    "Todos",
    ...Array.from(new Set(productos.map((p) => p.categoria.nombre))),
  ];

  const productosFiltrados = productos.filter((p) => {
    const matchBusqueda = p.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    const matchCategoria =
      categoriaActiva === "Todos" || p.categoria.nombre === categoriaActiva;
    return matchBusqueda && matchCategoria;
  });

  // Agregar o incrementar un producto en el carrito
  const agregarAlCarrito = (producto: Producto) => {
    const stockDisponible = producto.stock?.cantidad ?? 0;
    const cantidadActual = carrito[producto.id]?.cantidad ?? 0;

    if (cantidadActual >= stockDisponible) return;

    setCarrito((prev) => ({
      ...prev,
      [producto.id]: {
        producto,
        cantidad: cantidadActual + 1,
      },
    }));
  };

  const cambiarCantidad = (productoId: number, delta: number) => {
    setCarrito((prev) => {
      const item = prev[productoId];
      if (!item) return prev;

      const nuevaCantidad = item.cantidad + delta;

      if (nuevaCantidad <= 0) {
        // Si la cantidad llega a 0 eliminamos el item del carrito
        const nuevoCarrito = { ...prev };
        delete nuevoCarrito[productoId];
        return nuevoCarrito;
      }

      const stockDisponible = item.producto.stock?.cantidad ?? 0;
      if (nuevaCantidad > stockDisponible) return prev;

      return { ...prev, [productoId]: { ...item, cantidad: nuevaCantidad } };
    });
  };

  const limpiarCarrito = () => {
    setCarrito({});
    setMedioDePago(null);
  };

  const itemsCarrito = Object.values(carrito);
  const totalCarrito = itemsCarrito.reduce(
    (acc, item) => acc + Number(item.producto.precioVenta) * item.cantidad,
    0,
  );
  const cantidadItems = itemsCarrito.reduce(
    (acc, item) => acc + item.cantidad,
    0,
  );

  const handleConfirmar = async () => {
    if (!medioDePago || itemsCarrito.length === 0) return;
    setConfirmando(true);
    setError("");

    try {
      await createSale(
        itemsCarrito.map((item) => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
        })),
        medioDePago,
      );

      setExito(true);
      limpiarCarrito();
      await cargarProductos(); // Recargamos para actualizar el stock mostrado

      setTimeout(() => setExito(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al registrar la venta");
    } finally {
      setConfirmando(false);
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
    <div className="flex gap-5 h-[calc(100vh-120px)]">
      {/* ── Columna izquierda: catálogo ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4">
          <h1 className="text-lg font-semibold text-gray-900">
            Registrar venta
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Seleccioná los productos del pedido
          </p>
        </div>

        {/* Búsqueda */}
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-emerald-400 mb-3"
        />

        {/* Filtros por categoría */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                categoriaActiva === cat
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grilla de productos */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            {productosFiltrados.map((producto) => {
              const enCarrito = carrito[producto.id]?.cantidad ?? 0;
              const stockDisponible = producto.stock?.cantidad ?? 0;
              const sinStock = stockDisponible === 0;

              return (
                <button
                  key={producto.id}
                  onClick={() => !sinStock && agregarAlCarrito(producto)}
                  disabled={sinStock}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    sinStock
                      ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                      : enCarrito > 0
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900 leading-tight mb-1">
                    {producto.nombre}
                  </p>
                  <p className="text-sm text-emerald-600 font-semibold">
                    ${Number(producto.precioVenta).toLocaleString("es-AR")}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      Stock: {stockDisponible}
                    </span>
                    {enCarrito > 0 && (
                      <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-medium">
                        {enCarrito}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Columna derecha: carrito ── */}
      <div className="w-80 flex flex-col bg-white border border-gray-100 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Pedido actual
          {cantidadItems > 0 && (
            <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {cantidadItems} items
            </span>
          )}
        </h2>

        {/* Items del carrito */}
        <div className="flex-1 overflow-y-auto">
          {itemsCarrito.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-gray-300">
                Ningún producto seleccionado
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {itemsCarrito.map(({ producto, cantidad }) => (
                <div
                  key={producto.id}
                  className="flex items-center gap-2 py-2 border-b border-gray-50"
                >
                  <p className="flex-1 text-sm text-gray-800 leading-tight">
                    {producto.nombre}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => cambiarCantidad(producto.id, -1)}
                      className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm flex items-center justify-center cursor-pointer transition-colors"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium text-gray-900 w-5 text-center">
                      {cantidad}
                    </span>
                    <button
                      onClick={() => cambiarCantidad(producto.id, 1)}
                      className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm flex items-center justify-center cursor-pointer transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-20 text-right">
                    $
                    {(Number(producto.precioVenta) * cantidad).toLocaleString(
                      "es-AR",
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">Total</span>
            <span className="text-xl font-semibold text-gray-900">
              ${totalCarrito.toLocaleString("es-AR")}
            </span>
          </div>

          {/* Medios de pago */}
          <p className="text-xs text-gray-400 mb-2">Medio de pago</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {mediosDePago.map(({ valor, label }) => (
              <button
                key={valor}
                onClick={() => setMedioDePago(valor)}
                className={`py-2 text-xs rounded-lg border transition-colors cursor-pointer ${
                  medioDePago === valor
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700 font-medium"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

          {/* Éxito */}
          {exito && (
            <p className="text-xs text-emerald-600 font-medium mb-3 text-center">
              Venta registrada correctamente
            </p>
          )}

          {/* Botón confirmar */}
          <button
            onClick={handleConfirmar}
            disabled={itemsCarrito.length === 0 || !medioDePago || confirmando}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-100 disabled:text-gray-300 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {confirmando ? "Registrando..." : "Confirmar venta"}
          </button>

          {/* Limpiar carrito */}
          {itemsCarrito.length > 0 && (
            <button
              onClick={limpiarCarrito}
              className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              Limpiar carrito
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ventas;
