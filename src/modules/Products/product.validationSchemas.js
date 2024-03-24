import joi from "joi";
export const createProductSchema = {
  body: joi
    .object({
      name: joi.string().min(3).max(30).required(),
      price: joi.number().required(),
      quantity: joi.number().required(),
      description: joi.string().required(),
      categoryId: joi.string().required(),
      subCategoryId: joi.string().required(),
      brandId: joi.string().required(),
      colors: joi.array().items(joi.string()),
      sizes: joi.array().items(joi.string()),
      stock: joi.number().required(),
      appliedDiscount: joi.number().default(0),
      priceAfterDiscount: joi.number().default(1),
    })
    .required(),
};
export const updateProductSchema = {
  body: joi
    .object({
      name: joi.string().min(3).max(30).optional(),
      price: joi.number().optional(),
      quantity: joi.number().optional(),
      description: joi.string().optional(),
      categoryId: joi.string().optional(),
      subCategoryId: joi.string().optional(),
      brandId: joi.string().optional(),
      colors: joi.array().items(joi.string()).optional(),
      sizes: joi.array().items(joi.string()).optional(),
      stock: joi.number().optional(),
      appliedDiscount: joi.number().optional(),
      priceAfterDiscount: joi.number().optional(),
    })
    .required(),
};
