import { subCategoryModel } from "../../../DB/Models/subCategory.model.js";
import { categoryModel } from "../../../DB/Models/category.model.js";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("123456_=!ascbhdtel", 5);
import slugify from "slugify";
import cloudinary from "../../utils/coludinaryConfigrations.js";
import { brandModel } from "../../../DB/Models/brand.model.js";
export const addBrand = async (req, res, next) => {
  const { name } = req.body;
  const { categoryId, subCategoryId } = req.query;
  if (!name || !categoryId || !subCategoryId) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
  const category = await categoryModel.findById(categoryId);
  const subCategory = await subCategoryModel.findById(subCategoryId);
  const customId = nanoid();
  if (!subCategory)
    return next(new Error("SubCategory not found", { cause: 400 }));
  if (!category) return next(new Error("Category not found", { cause: 400 }));
  const slug = slugify(name, {
    lower: true,
    replacement: "_",
  });
  if (!req.file) return next(new Error("logo is required", { cause: 400 }));
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.PROJECT_FOLDER}/category/${category.customId}/subCategory/${subCategory.customId}/brand/${customId}`,
    }
  );
  const brand = await brandModel.create({
    name,
    slug,
    logo: { secure_url, public_id },
    categoryId,
    subCategoryId,
    customId,
  });
  if (!brand) {
    await cloudinary.uploader.destroy(public_id);
    return next(new Error("Brand not created", { cause: 500 }));
  }
  res.status(201).json({ message: "Brand created succesfully", brand });
};
