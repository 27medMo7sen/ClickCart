import { Router } from "express";
import * as pa from "./product.endpoints.roles.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import * as pc from "./product.controller.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import * as validationSchema from "./product.validationSchemas.js";
import { isAuth } from "../../middlewares/auth.js";
const router = Router();

router.post(
  "/",
  isAuth(pa.addProduct),
  multerCloudFunction(allowedExtensions.Image).array("images", 3),
  validationCoreFunction(validationSchema.createProductSchema),
  asyncHandler(pc.addProduct)
);
router.put(
  "/",
  isAuth(pa.updateProduct),
  multerCloudFunction(allowedExtensions.Image).array("images", 3),
  validationCoreFunction(validationSchema.updateProductSchema),
  asyncHandler(pc.updateProduct)
);
router.get("/", asyncHandler(pc.getAllProducts));
// router.get("/getProductsByName", asyncHandler(pc.getProductsByName));
router.delete("/", isAuth(pa.deleteProduct), asyncHandler(pc.deleteProduct));
router.get("/listProduct", asyncHandler(pc.listProducts));

export default router;
