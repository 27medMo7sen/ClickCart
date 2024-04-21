import { Router } from "express";
import { isAuth } from "../../middlewares/auth.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import * as cc from "./category.controller.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import * as validationSchema from "./category.validationSchemas.js";
import * as ca from "./category.endpoints.roles.js";
const router = Router();

router.post(
  "/",
  isAuth(ca.addCategory),
  multerCloudFunction(allowedExtensions.Image).single("image"),
  validationCoreFunction(validationSchema.createCategorySchema),
  asyncHandler(cc.addCategory)
);
router.post(
  "/:categoryId",
  isAuth(ca.updateCategory),
  multerCloudFunction(allowedExtensions.Image).single("image"),
  validationCoreFunction(validationSchema.updateCategorySchema),
  asyncHandler(cc.updateCategory)
);
router.delete(
  "/deleteCategory",
  isAuth(ca.deleteCategory),
  asyncHandler(cc.deleteCategory)
);
router.get("/", asyncHandler(cc.getAllCategories));
export default router;
