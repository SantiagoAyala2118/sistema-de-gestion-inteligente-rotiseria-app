import { Request } from "express";

export interface AuthPayload {
  id: number;
  email: string;
  rol: "OPERADOR" | "ADMINISTRADOR";
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}
