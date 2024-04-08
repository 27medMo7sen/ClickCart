import { Router } from "express";
const router = Router();
import * as cc from "./coupon.controller.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { addCouponSchema } from "./coupon.validationSchemas.js";
import { isAuth } from "../../middlewares/auth.js";

router.post(
  "/",
  isAuth(),
  validationCoreFunction(addCouponSchema),
  asyncHandler(cc.addCoupon)
);
export default router;
