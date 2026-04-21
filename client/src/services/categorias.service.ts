import api from "./api";
import type { Categoria } from "../types";

export const getCategories = async (): Promise<Categoria[]> => {
  const { data } = await api.get("/categories");
  return data.data.categorias;
};
