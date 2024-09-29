import { Router } from "express";
import * as sc from "./subCategory.controller.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import * as validationSchema from "./subCategory.validationSchemas.js";
import * as sa from "./subCategory.endpoints.roles.js";
import { isAuth } from "../../middlewares/auth.js";
const router = Router();
router.post(
  "/",
  isAuth(sa.addSubcategory),
  multerCloudFunction(allowedExtensions.Image).single("image"),
  validationCoreFunction(validationSchema.createSubCategorySchema),
  asyncHandler(sc.addSubcategory)
);
router.get("/", asyncHandler(sc.getAllSubCategories));
router.put(
  "/",
  isAuth(sa.updateSubCategory),
  multerCloudFunction(allowedExtensions.Image).single("image"),
  validationCoreFunction(validationSchema.updateSubCategorySchema),
  asyncHandler(sc.updateSubCategory)
);
router.delete(
  "/deleteSubCategory",
  isAuth(sa.deleteSubCategory),
  asyncHandler(sc.deleteSubCategory)
);
export default router;
