import { Router } from "express";
import * as ac from "./auth.controller.js";
import { isAuth } from "../../middlewares/auth.js";
import { asyncHandler } from "../../utils/errorhandling.js";
import { roles } from "../../utils/roles.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  updateProfileSchema,
  signupSchema,
} from "./auth.validationSchemas.js";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utils/allowedExtensions.js";
const router = Router();
router.get("/confirm/:token", asyncHandler(ac.confirmEmail));
router.get(
  "/profile",
  isAuth([roles.ADMIN, roles.SUBERADMIN, roles.USER]),
  ac.profile
);
router.post(
  "/addProfilePic",
  isAuth([roles.ADMIN, roles.SUBERADMIN, roles.USER]),
  multerCloudFunction(allowedExtensions.Image).single("image"),
  asyncHandler(ac.addProfilePic)
);
router.post(
  "/login",
  validationCoreFunction(loginSchema),
  asyncHandler(ac.logIn)
);
router.put(
  "/updateProfile",
  isAuth([roles.ADMIN, roles.SUBERADMIN, roles.USER]),
  validationCoreFunction(updateProfileSchema),
  asyncHandler(ac.editProfile)
);
router.patch(
  "/resetPassword/:token",
  validationCoreFunction(resetPasswordSchema),
  asyncHandler(ac.resetPassword)
);
router.post("/", validationCoreFunction(signupSchema), asyncHandler(ac.signUp));
router.patch(
  "/forgotPassword",
  validationCoreFunction(forgotPasswordSchema),
  asyncHandler(ac.forgotPassword)
);
router.patch(
  "/logout",
  isAuth([roles.ADMIN, roles.SUBERADMIN, roles.USER]),
  asyncHandler(ac.logOut)
);

export default router;
