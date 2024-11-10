import joi from "joi";
import { generalFields } from "../../middlewares/validation.js";
export const createProductSchema = {
  body: joi.object({
    name: joi.string().min(3).max(30).required().messages({
      "string.base": `name should be a type of text`,
      "string.empty": `name cannot be an empty field`,
      "string.min": `name should have a minimum length of 3`,
      "string.max": `name should have a maximum length of 20`,
      "any.required": `name is a required field`,
    }),
    price: joi.number().required().messages({
      "number.base": `price should be a type of number`,
      "number.empty": `price cannot be an empty field`,
      "any.required": `price is a required field`,
    }),
    desc: joi.string().required().messages({
      "string.base": `desc should be a type of text`,
      "string.empty": `desc cannot be an empty field`,
      "any.required": `desc is a required field`,
    }),
    colors: joi
      .alternatives()
      .try(joi.string(), joi.array().items(joi.string())),
    sizes: joi
      .alternatives()
      .try(joi.string(), joi.array().items(joi.string())),
    stock: joi.number().required().min(1).messages({
      "number.base": `stock should be a type of number`,
      "number.empty": `stock cannot be an empty field`,
      "any.required": `stock is a required field`,
      "any.min": `stock should have a minimum value of 1`,
    }),
    appliedDiscount: joi.number().default(0).min(0).max(100),
    priceAfterDiscount: joi.number().default(1),
  }),
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
      appliedDiscount: joi.number().default(0).min(0).max(100),
      priceAfterDiscount: joi.number().default(1),
      oldImages: joi
        .alternatives()
        .try(joi.string(), joi.array().items(joi.string())),
    })
    .required(),
};
