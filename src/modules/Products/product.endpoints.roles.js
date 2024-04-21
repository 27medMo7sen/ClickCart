import { roles } from "../../utils/roles.js";

export const addProduct = [roles.ADMIN, roles.SUBERADMIN];
export const updateProduct = [roles.ADMIN, roles.SUBERADMIN];
export const deleteProduct = [roles.ADMIN, roles.SUBERADMIN];
