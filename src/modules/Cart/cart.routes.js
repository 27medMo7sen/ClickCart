import { Router } from "express";
const router = Router();
import * as cc from "./cart.controller.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { addToCartSchema } from "./cart.validationSchemas.js";
import { isAuth } from "../../middlewares/auth.js";

router.post(
  "/",
  isAuth(),
  validationCoreFunction(addToCartSchema),
  asyncHandler(cc.addToCart)
);
router.put("/deleteFromCart", isAuth(), asyncHandler(cc.deleteFromTheCart));
// router.post("/updateCoupon", isAuth(), asyncHandler(cc.updateCoupon));
// router.delete(
//   "/deleteCoupon",
//   isAuth(),
//   validationCoreFunction(deleteCouponSchema),
//   asyncHandler(cc.deleteCoupon)
// );
export default router;
