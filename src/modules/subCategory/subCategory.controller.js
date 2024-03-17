import { categoryModel } from "../../../DB/Models/category.model.js";
import { subCategoryModel } from "../../../DB/Models/subCategory.model.js";
import cloudinary from "../../utils/coludinaryConfigrations.js";
import { customAlphabet } from "nanoid";
import slugify from "slugify";
const nanoid = customAlphabet("123456_=!ascbhdtel", 5);
export const createSubCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  const { name } = req.body;
  if (!(await categoryModel.findById(categoryId)))
    return next(new Error("Category not found", { cause: 404 }));
  if (await subCategoryModel.findOne({ name }))
    return next(new Error("SubCategory already exists", { cause: 400 }));
  const slug = slugify(name, "_");
  const subCategoryId = nanoid();
  if (!req.file) return next(new Error("Image is required", { cause: 400 }));
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.PROJECT_FOLDER}/category/${subCategoryId}`,
    }
  );
  const subCategory = await subCategoryModel.create({
    name,
    slug,
    image: { secure_url, public_id },
    categoryId,
  });
  if (!subCategory) {
    await cloudinary.uploader.destroy(public_id);
    return next(new Error("SubCategory not created", { cause: 500 }));
  }
  res
    .status(201)
    .json({ message: "SubCategory created succesfully", subCategory });
};
export const getAllSubCategories = async (req, res, next) => {
  const subCategories = await subCategoryModel
    .find()
    .populate("categoryId")
    .select("name slug image categoryId");
  if (!subCategories)
    return next(new Error("SubCategories not found", { cause: 404 }));
  res.status(200).json({ subCategories });
};
