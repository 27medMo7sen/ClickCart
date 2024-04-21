import { Router } from "express";
const router = Router();
import * as oc from "./order.controller.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { isAuth } from "../../middlewares/auth.js";
import * as oa from "./order.endpoints.roles.js";
router.post("/", isAuth(oa.addOrder), asyncHandler(oc.addOrder));
router.put(
  "/cartToOrder",
  isAuth(oa.cartToOrder),
  asyncHandler(oc.cartToOrder)
);
router.get("/success", asyncHandler(oc.successPayment));
router.get("/cancel", asyncHandler(oc.cancelPayment));
export default router;
