import { Router } from "express";
const router = Router();
import * as oc from "./order.controller.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { isAuth } from "../../middlewares/auth.js";
router.post("/", isAuth(), asyncHandler(oc.addOrder));
export default router;
