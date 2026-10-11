import { Router } from "express";
import { productController } from "../controllers/product.controller.js";
import { validateProductBody } from "../middleware/validate-body.js";
import { validateProductId } from "../middleware/validate-product-id.js";

export const productRouter = Router();
productRouter.get("/", productController.list);
productRouter.get("/:id", validateProductId, productController.getById);
productRouter.post("/", validateProductBody, productController.create);
