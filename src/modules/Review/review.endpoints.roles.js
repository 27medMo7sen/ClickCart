import { roles } from "../../utils/roles.js";

export const addReview = [roles.ADMIN, roles.SUBERADMIN, roles.USER];
export const deleteFromCart = [roles.ADMIN, roles.SUBERADMIN, roles.USER];
