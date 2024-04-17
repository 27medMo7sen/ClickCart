import { Router } from "express";
const router = Router();
import * as cc from "./coupon.controller.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import {
  addCouponSchema,
  deleteCouponSchema,
} from "./coupon.validationSchemas.js";
import { isAuth } from "../../middlewares/auth.js";

router.post(
  "/",
  isAuth(),
  validationCoreFunction(addCouponSchema),
  asyncHandler(cc.addCoupon)
);
router.post("/updateCoupon", isAuth(), asyncHandler(cc.updateCoupon));
router.delete(
  "/deleteCoupon",
  isAuth(),
  validationCoreFunction(deleteCouponSchema),
  asyncHandler(cc.deleteCoupon)
);
export default router;
