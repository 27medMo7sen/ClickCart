import { Router } from "express";
import { asyncHandler } from "../../utils/errorhandling.js";
import * as bc from "./brand.controller.js";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { isAuth } from "../../middlewares/auth.js";
import * as validationSchema from "./brand.validationSchemas.js";
import * as ba from "./brands.endpoints.roles.js";
const router = Router();
router.post(
  "/",
  isAuth(ba.addBrand),
  multerCloudFunction(allowedExtensions.Image).single("logo"),
  validationCoreFunction(validationSchema.addBrandSchema),
  asyncHandler(bc.addBrand)
);
router.post(
  "/searchAdminBrands",
  isAuth(ba.searchAdminBrands),
  asyncHandler(bc.searchAdminBrands)
);
router.post(
  "/searchBrands",
  isAuth(ba.searchAdminBrands),
  asyncHandler(bc.searchBrands)
);
router.get("/", asyncHandler(bc.getBrands));
router.get(
  "/getAdminBrands",
  isAuth(ba.getAdminBrands),
  asyncHandler(bc.getAdminBrands)
);
router.put(
  "/updateBrand",
  isAuth(ba.updateBrand),
  multerCloudFunction(allowedExtensions.Image).single("logo"),
  validationCoreFunction(validationSchema.updateBrandSchema),
  asyncHandler(bc.updateBrand)
);
router.delete(
  "/deleteBrand",
  isAuth(ba.deleteBrand),
  asyncHandler(bc.deleteBrand)
);
export default router;
