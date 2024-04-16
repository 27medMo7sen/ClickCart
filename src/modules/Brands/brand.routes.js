import { Router } from "express";
import { asyncHandler } from "../../utils/errorhandling.js";
import * as bc from "./brand.controller.js";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { get } from "mongoose";
import { isAuth } from "../../middlewares/auth.js";
const router = Router();
router.post(
  "/",
  isAuth(),
  multerCloudFunction(allowedExtensions.Image).single("logo"),
  asyncHandler(bc.addBrand)
);
router.get("/", asyncHandler(bc.getBrands));
router.put(
  "/updateBrand",
  isAuth(),
  multerCloudFunction(allowedExtensions.Image).single("logo"),
  asyncHandler(bc.updateBrand)
);
router.delete("/deleteBrand", isAuth(), asyncHandler(bc.deleteBrand));
export default router;
