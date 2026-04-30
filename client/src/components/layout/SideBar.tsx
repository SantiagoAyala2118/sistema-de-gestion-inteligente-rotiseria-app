import { NavLink } from "react-router-dom";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <rect
          x="1"
          y="1"
          width="6"
          height="6"
          rx="1.5"
          fill="currentColor"
          opacity=".8"
        />
        <rect
          x="9"
          y="1"
          width="6"
          height="6"
          rx="1.5"
          fill="currentColor"
          opacity=".4"
        />
        <rect
          x="1"
          y="9"
          width="6"
          height="6"
          rx="1.5"
          fill="currentColor"
          opacity=".4"
        />
        <rect
          x="9"
          y="9"
          width="6"
          height="6"
          rx="1.5"
          fill="currentColor"
          opacity=".4"
        />
      </svg>
    ),
  },
  {
    label: "Registrar venta",
    path: "/ventas",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 4h12M2 8h8M2 12h10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Inventario",
    path: "/inventory",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <rect
          x="2"
          y="2"
          width="12"
          height="12"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M5 8h6M8 5v6"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Historial",
    path: "/historial",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="9" r="6" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M8 2v4l3 2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Productos",
    path: "/products",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <path
          d="M3 13V6l5-4 5 4v7"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="6"
          y="9"
          width="4"
          height="4"
          rx="0.5"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
    ),
  },
  {
    label: "Cierre del día",
    path: "/cierre",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <rect
          x="2"
          y="3"
          width="12"
          height="11"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M5 1v4M11 1v4M2 7h12"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const Sidebar = () => {
  return (
    <aside className="fixed top-0 left-0 h-screen w-44 bg-white border-r border-gray-100 flex flex-col py-4 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 mb-6">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        <span className="text-sm font-semibold text-gray-800">Rotisería</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 px-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-emerald-50 text-emerald-600 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer del sidebar — usuario */}
      <div className="px-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">Gestión Rotisería v1.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
