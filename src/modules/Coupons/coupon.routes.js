import { Router } from "express";
const router = Router();
import * as cc from "./coupon.controller.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import {
  addCouponSchema,
  deleteCouponSchema,
} from "./coupon.validationSchemas.js";
import * as ca from "./coupon.endpoints.roles.js";
import { isAuth } from "../../middlewares/auth.js";

router.post(
  "/",
  isAuth(ca.addCoupon),
  validationCoreFunction(addCouponSchema),
  asyncHandler(cc.addCoupon)
);
router.post(
  "/updateCoupon",
  isAuth(ca.updateCoupon),
  asyncHandler(cc.updateCoupon)
);
router.delete(
  "/deleteCoupon",
  isAuth(ca.deleteCoupon),
  validationCoreFunction(deleteCouponSchema),
  asyncHandler(cc.deleteCoupon)
);
export default router;
