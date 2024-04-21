import { roles } from "../../utils/roles.js";

export const addOrder = [roles.ADMIN, roles.SUBERADMIN, roles.USER];
export const updateOrder = [roles.ADMIN, roles.SUBERADMIN, roles.USER];
export const cartToOrder = [roles.ADMIN, roles.SUBERADMIN, roles.USER];
export const deleteOrder = [roles.ADMIN, roles.SUBERADMIN, roles.USER];
