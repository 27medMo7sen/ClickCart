import Joi from "joi";
export const createCategorySchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(20).messages({
      "string.base": "name must be a string",
      "string.empty": "name cannot be an empty field",
      "string.min": "name should have a minimum length of 3",
      "string.max": "name should have a maximum length of 20",
    }),
  })
    .required()
    .options({ presence: "required" }),
};
export const updateCategorySchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(20).messages({
      "string.base": "name must be a string",
      "string.empty": "name cannot be an empty field",
      "string.min": "name should have a minimum length of 3",
      "string.max": "name should have a maximum length of 20",
    }),
  }).required(),
};
