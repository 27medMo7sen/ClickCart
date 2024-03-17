import Joi from "joi";
export const createCategorySchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(10),
  })
    .required()
    .options({ presence: "required" }),
};
