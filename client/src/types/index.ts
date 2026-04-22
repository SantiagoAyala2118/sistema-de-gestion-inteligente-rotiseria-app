export interface Categoria {
  id: number;
  nombre: string;
}

export interface Stock {
  id: number;
  cantidad: number;
  umbralMinimo: number;
}

export interface Producto {
  id: number;
  nombre: string;
  precioVenta: number;
  costoUnidad: number;
  activo: boolean;
  categoriaId: number;
  categoria: Categoria;
  stock: Stock | null;
}
