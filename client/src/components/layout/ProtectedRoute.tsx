import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface Props {
  children: React.ReactNode;
  soloAdmin?: boolean;
}

const ProtectedRoute = ({ children, soloAdmin = false }: Props) => {
  const { token, isAdmin, cargando } = useAuth();

  if (cargando) return null;

  if (!token) {
    return <Navigate to={"./login"} replace />;
  }

  if (soloAdmin && !isAdmin) {
    return <Navigate to={"./dashboard"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
