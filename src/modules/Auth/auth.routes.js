import { Router } from "express";
import * as ac from "./auth.controller.js";
import { isAuth } from "../../middlewares/auth.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { roles } from "../../utils/roles.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { loginSchema, signupSchema } from "./auth.validationSchemas.js";
const router = Router();
router.get("/confirm/:token", asyncHandler(ac.confirmEmail));
router.get(
  "/login",
  validationCoreFunction(loginSchema),
  asyncHandler(ac.logIn)
);
router.post("/resetPassword/:token", asyncHandler(ac.resetPassword));
router.post("/", validationCoreFunction(signupSchema), asyncHandler(ac.signUp));
router.patch("/forgotPassword", asyncHandler(ac.forgotPassword));
router.patch(
  "/logout",
  isAuth([roles.ADMIN, roles.SUBERADMIN, roles.USER]),
  asyncHandler(ac.logOut)
);
export default router;
