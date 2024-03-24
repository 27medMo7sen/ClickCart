import Joi from 'joi';
export const updateCategorySchema = {
    body: Joi.object({
      name: Joi.string().min(3).max(30).optional(),
    }).required(),
  };