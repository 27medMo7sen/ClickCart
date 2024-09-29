import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";
export const createProductSchema = {
  body: joi
    .object({
      name: joi.string().min(3).max(30).required(),
      price: joi.number().required(),
      desc: joi.string().required(),
      colors: joi
        .alternatives()
        .try(joi.string(), joi.array().items(joi.string())),
      sizes: joi.array().items(joi.string()),
      stock: joi.number().required(),
      appliedDiscount: joi.number().default(0),
      priceAfterDiscount: joi.number().default(1),
    })
    .required(),
  query: joi.object({
    categoryId: generalFields._id.required(),
    subCategoryId: generalFields._id.required(),
    brandId: generalFields._id.required(),
  }),
};
export const updateProductSchema = {
  body: joi
    .object({
      name: joi.string().min(3).max(30),
      price: joi.number(),
      colors: joi
        .alternatives()
        .try(joi.string(), joi.array().items(joi.string())),
      sizes: joi
        .alternatives()
        .try(joi.string(), joi.array().items(joi.string())),
      stock: joi.number(),
      desc: joi.string(),
      appliedDiscount: joi.number(),
      priceAfterDiscount: joi.number(),
    })
    .required(),
};
