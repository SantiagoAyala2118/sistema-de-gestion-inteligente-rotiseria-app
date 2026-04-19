import jwt from "jsonwebtoken";
import { hashPassword, comparePassword } from "../helpers/bcrypt";
import prisma from "../prisma/client";
import { AuthPayload } from "../types/index";

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

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET no está definido en las variables de entorno");
  }

  const token = jwt.sign(payload, jwtSecret, {
    expiresIn: "12h",
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
