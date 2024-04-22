import Joi from "joi";
import { generalFields } from "../../middlewares/validation.js";
export const addReviewSchema = {
  body: Joi.object({
    review: Joi.string().min(5).max(100).optional(),
    rating: Joi.number().min(1).max(5).required(),
  }),
  query: Joi.object({ productId: generalFields._id.required() }),
};
