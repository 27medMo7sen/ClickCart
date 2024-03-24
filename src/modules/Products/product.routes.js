import { Router } from "express";
import { asyncHandler } from "../../utils/errorhandling.js";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import * as pc from "./product.controller.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import * as validationSchema from "./product.validationSchemas.js";
const router = Router();
router.post(
  "/",
  multerCloudFunction(allowedExtensions.Image).array("images", 3),
  validationCoreFunction(validationSchema.createProductSchema),
  asyncHandler(pc.createProduct)
);
router.put(
  "/",
  multerCloudFunction(allowedExtensions.Image).array("images", 3),
  validationCoreFunction(validationSchema.updateProductSchema),
  asyncHandler(pc.updateProduct)
);
export default router;
