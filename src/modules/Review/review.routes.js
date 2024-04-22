import { Router } from "express";
const router = Router();
import * as rc from "./review.controller.js";
import * as vs from "./review.validationSchemas.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import * as ra from "./review.endpoints.roles.js";
import { isAuth } from "../../middlewares/auth.js";
router.post(
  "/",
  isAuth(ra.addReview),
  validationCoreFunction(vs.addReviewSchema),
  asyncHandler(rc.addReview)
);

export default router;
