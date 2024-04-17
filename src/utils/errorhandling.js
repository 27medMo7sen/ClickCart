import { productModel } from "../../DB/Models/product.model.js";
import cloudinary from "./coludinaryConfigrations.js";

export const asyncHandler = (API) => {
  return (req, res, next) => {
    API(req, res, next).catch(async (err) => {
      console.log(err);
      console.log(req.imagesPath);
      if (req.imagesPath) {
        await cloudinary.api.delete_resources_by_prefix(req.imagesPath);
        await cloudinary.api.delete_folder(req.imagesPath);
        await productModel.deleteOne({ customId: req.customId });
      }
      return next(new Error("Fail", { cause: 500 }));
    });
  };
};

export const globalResponse = (err, req, res, next) => {
  if (req.validationErrorArr) {
    return res.status(400).json({ message: req.validationErrorArr });
  }
  if (err) {
    return res.status(err["cause"] || 500).json({ message: err.message });
  }
};
