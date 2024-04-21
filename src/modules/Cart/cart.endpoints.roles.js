import { roles } from "../../utils/roles.js";

export const addToCart = [roles.ADMIN, roles.SUBERADMIN, roles.USER];
export const deleteFromCart = [roles.ADMIN, roles.SUBERADMIN, roles.USER];
