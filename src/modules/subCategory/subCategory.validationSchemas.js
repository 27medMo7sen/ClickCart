import Joi from "joi";
export const createSubCategorySchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(15),
  })
    .required()
    .options({ presence: "required" }),
};
export const updateSubCategorySchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(15),
  }).required(),
};
