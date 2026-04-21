import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Login = () => {
  //* Estados
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  //* Funcion que se ejecuta cuando el usuario envia el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.usuario);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <h1 className="text-xl font-semibold text-gray-900">
            Gestión Rotisería
          </h1>
        </div>
        <p className="text-sm text-gray-400 mb-8">
          Iniciá sesión para continuar
        </p>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          {/* Mensaje de error */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-200 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
