import { categoryModel } from "../../../DB/Models/category.model.js";
import { subCategoryModel } from "../../../DB/Models/subCategory.model.js";
import cloudinary from "../../utils/coludinaryConfigrations.js";
import slugify from "slugify";
import { productModel } from "../../../DB/Models/product.model.js";
import { brandModel } from "../../../DB/Models/brand.model.js";
// MARK: add subcategory
export const addSubcategory = async (req, res, next) => {
  const { _id } = req.user;
  const { categoryId } = req.query;
  const { name } = req.body;
  const category = await categoryModel.findById(categoryId);
  if (!category) return next(new Error("Category not found", { cause: 404 }));
  if (await subCategoryModel.findOne({ name, categoryId }))
    return next(new Error("SubCategory already exists", { cause: 436 }));
  const slug = slugify(name, {
    replacement: "_",
    lower: true,
  });

  const subCategory = await subCategoryModel.create({
    name,
    slug,
    createdBy: _id,
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
// MARK: get all subcategories
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
// MARK: update subcategory
export const updateSubCategory = async (req, res, next) => {
  const { _id } = req.user;
  const { subCategoryId, categoryId, name } = req.query;
  const subCategory = await subCategoryModel.findById(subCategoryId);
  const category = await categoryModel.findById(categoryId);
  if (!subCategory)
    return next(new Error("SubCategory not found", { cause: 404 }));
  if (JSON.stringify(subCategory.createdBy) != JSON.stringify(_id))
    return next(
      new Error("You are not authorized to delete this subcategory", {
        cause: 401,
      })
    );
  if (!category) return next(new Error("Category not found", { cause: 404 }));

  if (name) {
    if (subCategory.name === name)
      return next(new Error("Please pick different name", { cause: 400 }));
    if (
      await subCategoryModel.findOne({
        name,
        categoryId,
        _id: { $ne: subCategoryId },
      })
    )
      return next(new Error("Subcategory already exists", { cause: 436 }));
    const slug = slugify(name, {
      replacement: "_",
      lower: true,
    });

    const updatedSubCategory = await subCategoryModel.findByIdAndUpdate(
      subCategoryId,
      {
        updatedBy: _id,
        name,
        slug,
      }
    );
  }
  res.status(200).json({ message: "SubCategory updated succesfully" });
};
// MARK: delete subcategory
export const deleteSubCategory = async (req, res, next) => {
  const { _id } = req.user;
  const { subCategoryId, categoryId } = req.query;
  const subCategory = await subCategoryModel.findById(subCategoryId);
  if (!subCategory)
    return next(new Error("SubCategory not found", { cause: 404 }));
  if (subCategory.createdBy != _id && req.user.role != "SuperAdmin")
    return next(
      new Error("You are not authorized to delete this subcategory", {
        cause: 401,
      })
    );
  const category = await categoryModel.findById(categoryId);
  if (!category) return next(new Error("Category not found", { cause: 404 }));
  await productModel.deleteMany({ subCategoryId });
  await brandModel.deleteMany({ subCategoryId });
  await subCategoryModel.findByIdAndDelete(subCategoryId);
  res.status(200).json({ message: "SubCategory deleted succesfully" });
};
// MARK: get subcategories by admin
export const getAdminSubCategories = async (req, res, next) => {
  const { _id } = req.user;
  const { categoryId } = req.query;
  const subCategories = await subCategoryModel.find({
    categoryId,
    createdBy: _id,
  });
  if (!subCategories)
    return next(new Error("SubCategories not found", { cause: 436 }));
  res.status(200).json({ subCategories });
};
