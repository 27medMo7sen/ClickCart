import { Router } from "express";
const router = Router();
import * as cc from "./cart.controller.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { addToCartSchema } from "./cart.validationSchemas.js";
import * as ca from "./cart.endpoints.roles.js";
import { isAuth } from "../../middlewares/auth.js";

router.post(
  "/",
  isAuth(ca.addToCart),
  validationCoreFunction(addToCartSchema),
  asyncHandler(cc.addToCart)
);
router.put(
  "/deleteFromCart",
  isAuth(ca.deleteFromCart),
  validationCoreFunction(addToCartSchema),
  asyncHandler(cc.deleteFromTheCart)
);
export default router;
