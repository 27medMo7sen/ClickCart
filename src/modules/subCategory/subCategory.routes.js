import { Router } from "express";
import * as sc from "./subCategory.controller.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import * as validationSchema from "./subCategory.validationSchemas.js";
const router = Router();
router.post(
  "/:categoryId",
  multerCloudFunction(allowedExtensions.Image).single("image"),
  validationCoreFunction(validationSchema.createSubCategorySchema),
  asyncHandler(sc.createSubCategory)
);
router.get("/", asyncHandler(sc.getAllSubCategories));
export default router;
