import { Request, Response } from "express";
import {
  obtenerProductoPorId,
  obtenerProductos,
  crearProducto,
  editarProducto,
  desactivarProducto,
} from "../services/productos.service";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const productos = await obtenerProductos();
    return res.status(200).json({
      ok: true,
      data: {
        productos,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductsById = async (req: Request, res: Response) => {
  try {
    const producto = await obtenerProductoPorId(Number(req.params.id));
    if (!producto)
      return res.status(404).json({ message: "Producto no encontrado" });
    res.status(200).json({
      ok: true,
      data: producto,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      nombre,
      precioVenta,
      costoUnidad,
      categoriaId,
      stockInicial,
      umbralMinimo,
    } = req.body;

    if (!nombre || !precioVenta || !costoUnidad || !categoriaId) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const producto = await crearProducto({
      nombre,
      precioVenta,
      costoUnidad,
      categoriaId,
      stockInicial,
      umbralMinimo,
    });

    return res.status(201).json({
      ok: true,
      data: producto,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const editProduct = async (req: Request, res: Response) => {
  try {
    const producto = await editarProducto(Number(req.params.id), req.body);
    return res.status(200).json({
      ok: true,
      data: producto,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deactivateProduct = async (req: Request, res: Response) => {
  try {
    await desactivarProducto(Number(req.params.id));
    return res.json({ message: "Producto desactivado correctamente" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
