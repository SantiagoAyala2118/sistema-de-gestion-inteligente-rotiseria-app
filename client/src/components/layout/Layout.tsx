import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar";
import Topbar from "./TopBar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />
      {/* El contenido de cada página va acá */}
      <main className="ml-44 pt-13 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
