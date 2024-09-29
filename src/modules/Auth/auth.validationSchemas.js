import Joi from "joi";
export const signupSchema = {
  body: Joi.object({
    userName: Joi.string().required().label("User name can't be empty"),
    email: Joi.string().email().required().label("Email can't be empty"),
    password: Joi.string()
      .min(6)
      .required()
      .label("Password must be at least 6 numbers"),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .label("Password must be the same"),
    age: Joi.number().positive().min(18).max(100).required().label("Above 18"),
    phoneNumber: Joi.string().required().label("Phone number can't be empty"),
  }),
};
export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
};
export const confirmEmailSchema = {
  params: Joi.object({
    token: Joi.string().required(),
  }),
};
