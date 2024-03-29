import { Router } from "express";
import { asyncHandler } from "../../utils/errorhandling.js";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import * as cc from "./category.controller.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import * as validationSchema from "./category.validationSchemas.js";
const router = Router();

router.post(
  "/",
  multerCloudFunction(allowedExtensions.Image).single("image"),
  validationCoreFunction(validationSchema.updateCategorySchema),
  asyncHandler(cc.addCategory)
);
router.post(
  "/:categoryId",
  multerCloudFunction(allowedExtensions.Image).single("image"),
  validationCoreFunction(validationSchema.createCategorySchema),
  asyncHandler(cc.updateCategory)
);
router.delete("/deleteCategory", asyncHandler(cc.deleteCategory));
router.get("/", asyncHandler(cc.getAllCategories));
export default router;
