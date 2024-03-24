import { Router } from "express";
import { asyncHandler } from "../../utils/errorhandling.js";
import * as bc from "./brand.controller.js";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { get } from "mongoose";
const router = Router();
router.post(
  "/",
  multerCloudFunction(allowedExtensions.Image).single("logo"),
  asyncHandler(bc.addBrand)
);
router.get("/", asyncHandler(bc.getBrands));
router.put(
  "/updateBrand",
  multerCloudFunction(allowedExtensions.Image).single("logo"),
  asyncHandler(bc.updateBrand)
);
router.delete("/deleteBrand", asyncHandler(bc.deleteBrand));
export default router;
