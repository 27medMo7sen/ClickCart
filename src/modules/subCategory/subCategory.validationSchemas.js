import Joi from "joi";
export const createSubCategorySchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(15).messages({
      "string.base": "name must be a string",
      "string.empty": "name cannot be an empty field",
      "string.min": "name should have a minimum length of 3",
      "string.max": "name should have a maximum length of 15",
    }),
  })
    .required()
    .options({ presence: "required" }),
};
export const updateSubCategorySchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(15).messages({
      "string.base": "name must be a string",
      "string.empty": "name cannot be an empty field",
      "string.min": "name should have a minimum length of 3",
      "string.max": "name should have a maximum length of 15",
    }),
  }).required(),
};
