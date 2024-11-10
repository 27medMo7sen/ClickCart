import { roles } from "../../utils/roles.js";

export const addCategory = [roles.ADMIN, roles.SUBERADMIN];
export const updateCategory = [roles.ADMIN, roles.SUBERADMIN];
export const getAdminCategory = [roles.ADMIN, roles.SUBERADMIN];
export const deleteCategory = [roles.ADMIN, roles.SUBERADMIN];
