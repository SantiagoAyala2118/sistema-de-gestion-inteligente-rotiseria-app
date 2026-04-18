import jwt from "jsonwebtoken";
import { hashPassword, comparePassword } from "../helpers/bcrypt.js";
import prisma from "../prisma/client.js";
import { AuthPayload } from "../types/index.js";

export const loginService = async (email: string, password: string) => {
  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario || !usuario.activo) {
    throw new Error("Credenciales invalidas");
  }

  const validPassword = await comparePassword(password, usuario.password);

  if (!validPassword) {
    throw new Error("Credenciales inválidas");
  }

  const payload: AuthPayload = {
    id: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET as String, {
    expiresIn: "12hs",
  });

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
  };
};

export const registerService = async (
  nombre: string,
  email: string,
  password: string,
  rol: "OPERADOR" | "ADMINISTRADOR" = "OPERADOR",
) => {
  const existe = await prisma.usuario.findFirst({ where: { email } });

  if (existe) {
    throw new Error("Email ya registrado");
  }

  const hashedPassword = await hashPassword(
    password,
    process.env.SALTS as string,
  );

  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      email,
      password: hashedPassword,
      rol,
    },
  });

  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  };
};
