import { Router } from "express";
import * as sc from "./subCategory.controller.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import * as validationSchema from "./subCategory.validationSchemas.js";
import { isAuth } from "../../middlewares/auth.js";
const router = Router();
router.post(
  "/:categoryId",
  isAuth(),
  multerCloudFunction(allowedExtensions.Image).single("image"),
  validationCoreFunction(validationSchema.createSubCategorySchema),
  asyncHandler(sc.addSubcategory)
);
router.get("/", asyncHandler(sc.getAllSubCategories));
router.put(
  "/",
  isAuth(),
  multerCloudFunction(allowedExtensions.Image).single("image"),
  validationCoreFunction(validationSchema.updateSubCategorySchema),
  asyncHandler(sc.updateSubCategory)
);
router.delete("/deleteSubCategory", asyncHandler(sc.deleteSubCategory));
export default router;
