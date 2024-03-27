import { Router } from "express";
import { asyncHandler } from "../../utils/errorhandling.js";
import * as cc from "./coupon.controller.js";
const router = Router();
router.post("/", asyncHandler(cc.createCoupon));
router.put("/:couponId", asyncHandler(cc.updateCoupon));
export default router;
