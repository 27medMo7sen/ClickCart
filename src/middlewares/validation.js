// req => userdata
// schema => endPoint schema
import joi from "joi";
import { Types } from "mongoose";
const reqMethods = ["body", "query", "params", "headers", "file", "files"];
const ObjectIdValidation = (value, helpers) => {
  return Types.ObjectId.isValid(value) ? value : helpers.error("Invalid Id");
};
export const generalFields = {
  email: joi
    .string()
    .email({ tlds: { allow: ["com", "net", "org"] } })
    .required(),
  password: joi
    .string()
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .messages({
      "string.pattern.base": "Password regex fail",
    })
    .required(),
  _id: joi.string().custom(ObjectIdValidation),
};

export const validationCoreFunction = (schema) => {
  return (req, res, next) => {
    // req
    console.log(req.body);
    const validationErrorArr = [];
    for (const key of reqMethods) {
      if (schema[key]) {
        console.log("hello");
        const validationResult = schema[key].validate(req[key], {
          abortEarly: false,
        }); // error

        if (validationResult.error) {
          validationErrorArr.push(validationResult.error.details);
        }
      }
    }
    console.log("hello");

    if (validationErrorArr.length) {
      return res
        .status(400)
        .json({ message: "Validation Error", Errors: validationErrorArr });
    }
    console.log("hello");
    next();
  };
};
