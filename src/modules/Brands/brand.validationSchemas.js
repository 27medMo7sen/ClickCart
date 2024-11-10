import Joi from "joi";
export const updateBrandSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(30).optional().messages({
      "string.base": `name should be a type of 'text'`,
      "string.empty": `name cannot be an empty field`,
      "string.min": `name should have a minimum length of {#limit}`,
      "string.max": `name should have a maximum length of {#limit}`,
      "any.required": `name is a required field`,
    }),
  }).required(),
};
export const addBrandSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(30).required().messages({
      "string.base": `name should be a type of 'text'`,
      "string.empty": `name cannot be an empty field`,
      "string.min": `name should have a minimum length of {#limit}`,
      "string.max": `name should have a maximum length of {#limit}`,
      "any.required": `name is a required field`,
    }),
  }).required(),
};
