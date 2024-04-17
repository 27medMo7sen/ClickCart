import Joi from "joi";
import { generalFields } from "../../middlewares/validation.js";

export const addCouponSchema = {
  body: Joi.object({
    couponCode: Joi.string().min(5).max(55).required(),
    couponAmount: Joi.number().positive().min(1).max(100).required(),
    fromDate: Joi.date()
      .greater(Date.now() - 24 * 60 * 60 * 1000)
      .required(),
    toDate: Joi.date().greater(Joi.ref("fromDate")).required(),
    isPercentage: Joi.boolean().optional(),
    isFixedAmount: Joi.boolean().optional(),
    couponAssginedToUsers: Joi.array()
      .items(
        Joi.object({
          userId: Joi.string().required(),
          maxUsage: Joi.number().positive().min(1).required(),
        })
      )
      .required(),
  }).required(),
};
export const updateCouponSchema = {
  body: Joi.object({
    couponAmount: Joi.number().positive().min(1).max(100).optional(),
    fromDate: Joi.date()
      .greater(Date.now() - 24 * 60 * 60 * 1000)
      .optional(),
    toDate: Joi.date().greater(Joi.ref("fromDate")).optional(),
    isPercentage: Joi.boolean().optional(),
    couponAssginedToUsers: Joi.array()
      .items(
        Joi.object({
          userId: Joi.string().required(),
          maxUsage: Joi.number().positive().min(1).required(),
        })
      )
      .optional(),
    isFixedAmount: Joi.boolean().optional(),
  }).required(),
};
export const deleteCouponSchema = {
  query: Joi.object({
    couponId: generalFields._id.required(),
  }).required(),
};
