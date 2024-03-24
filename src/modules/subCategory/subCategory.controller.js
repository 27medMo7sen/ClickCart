import { categoryModel } from "../../../DB/Models/category.model.js";
import { subCategoryModel } from "../../../DB/Models/subCategory.model.js";
import cloudinary from "../../utils/coludinaryConfigrations.js";
import slugify from "slugify";
import { customAlphabet } from "nanoid";
import { populate } from "dotenv";
import { productModel } from "../../../DB/Models/product.model.js";
import { brandModel } from "../../../DB/Models/brand.model.js";
const nanoid = customAlphabet("123456_=!ascbhdtel", 5);
export const createSubCategory = async (req, res, next) => {
  console.log(req.body);
  const { categoryId } = req.params;
  const { name } = req.body;
  const category = await categoryModel.findById(categoryId);
  if (!category) return next(new Error("Category not found", { cause: 404 }));
  if (await subCategoryModel.findOne({ name }))
    return next(new Error("SubCategory already exists", { cause: 400 }));
  const slug = slugify(name, {
    replacement: "_",
    lower: true,
  });
  const customId = nanoid();
  if (!req.file) return next(new Error("Image is required", { cause: 400 }));
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.PROJECT_FOLDER}/category/${category.customId}/subCategory/${customId}`,
    }
  );
  const subCategory = await subCategoryModel.create({
    name,
    slug,
    image: { secure_url, public_id },
    categoryId,
    customId,
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
    .populate({
      path: "categoryId",
    })
    .populate({
      path: "brands",
      populate: {
        path: "products",
      },
    });
  if (!subCategories)
    return next(new Error("SubCategories not found", { cause: 404 }));
  res.status(200).json({ subCategories });
};
export const updateSubCategory = async (req, res, next) => {
  const { subCategoryId, categoryId } = req.query;
  const { name } = req.body;
  const subCategory = await subCategoryModel.findById(subCategoryId);
  const category = await categoryModel.findById(categoryId);
  if (!subCategory)
    return next(new Error("SubCategory not found", { cause: 404 }));
  if (!category) return next(new Error("Category not found", { cause: 404 }));

  if (name) {
    if (subCategory.name === name)
      return next(new Error("Please pick different name", { cause: 400 }));
    if (await subCategoryModel.findOne({ name }))
      return next(new Error("SubCategory already exists", { cause: 400 }));
    const slug = slugify(name, {
      replacement: "_",
      lower: true,
    });
    await subCategoryModel.findByIdAndUpdate(subCategoryId, {
      name,
      slug,
    });
  }
  if (req.file) {
    // delete previous image
    await cloudinary.uploader.destroy(subCategory.image.public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.PROJECT_FOLDER}/category/${category.customId}/subCategory/${subCategory.customId}`,
      }
    );
    await subCategoryModel.findByIdAndUpdate(subCategoryId, {
      image: { secure_url, public_id },
    });
  }
  const updatedSubCategory = await subCategoryModel.findById(subCategoryId);
  res
    .status(200)
    .json({ message: "SubCategory updated succesfully", updatedSubCategory });
};
export const deleteSubCategory = async (req, res, next) => {
  const { subCategoryId, categoryId } = req.query;
  const subCategory = await subCategoryModel.findById(subCategoryId);
  if (!subCategory)
    return next(new Error("SubCategory not found", { cause: 404 }));
  const category = await categoryModel.findById(categoryId);
  if (!category) return next(new Error("Category not found", { cause: 404 }));
  await productModel.deleteMany({ subCategoryId });
  await brandModel.deleteMany({ subCategoryId });
  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.PROJECT_FOLDER}/category/${category.customId}/subCategory/${subCategory.customId}`
  );
  await cloudinary.api.delete_folder(
    `${process.env.PROJECT_FOLDER}/category/${category.customId}/subCategory/${subCategory.customId}`
  );
  await subCategoryModel.findByIdAndDelete(subCategoryId);
  res.status(200).json({ message: "SubCategory deleted succesfully" });
};
