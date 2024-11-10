import { roles } from "../../utils/roles.js";

export const addBrand = [roles.ADMIN, roles.SUBERADMIN];
export const updateBrand = [roles.ADMIN, roles.SUBERADMIN];
export const deleteBrand = [roles.ADMIN, roles.SUBERADMIN];
export const getBrands = [roles.ADMIN, roles.SUBERADMIN, roles.USER];
export const getAdminBrands = [roles.ADMIN, roles.SUBERADMIN];
export const searchAdminBrands = [roles.ADMIN, roles.SUBERADMIN];
