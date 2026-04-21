import { Router } from "express";
import {
  getProducts,
  getProductsById,
  createProduct,
  editProduct,
  deactivateProduct,
} from "../controllers/products.controller";
import { verificarToken, soloAdmin } from "../middlewares/auth.middleware";

const productRouter = Router();

// Todas las rutas de productos requieren estar logueado
productRouter.use(verificarToken);

productRouter.get("/", getProducts);
productRouter.get("/:id", getProductsById);

// Crear, editar y desactivar solo lo puede hacer el administrador
productRouter.post("/", soloAdmin, createProduct);
productRouter.put("/:id", soloAdmin, editProduct);
productRouter.delete("/:id", soloAdmin, deactivateProduct);

export default productRouter;
