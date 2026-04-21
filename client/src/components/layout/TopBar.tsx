import { useAuth } from "../../context/AuthContext";

const Topbar = () => {
  const { usuario, logout } = useAuth();

  const fechaHoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <header className="fixed top-0 left-44 right-0 h-13 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-10">
      {/* Fecha */}
      <span className="text-sm text-gray-400 capitalize">{fechaHoy}</span>

      {/* Derecha: rol + logout */}
      <div className="flex items-center gap-3">
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${
            usuario?.rol === "ADMINISTRADOR"
              ? "bg-blue-50 text-blue-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {usuario?.rol === "ADMINISTRADOR" ? "Administrador" : "Operador"}
        </span>

        <span className="text-sm text-gray-600 font-medium">
          {usuario?.nombre}
        </span>

        <button
          onClick={logout}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
        >
          Salir
        </button>
      </div>
    </header>
  );
};

export default Topbar;
