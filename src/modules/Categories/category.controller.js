import slugify from "slugify";
import { categoryModel } from "../../../DB/Models/category.model.js";
import cloudinary from "../../utils/coludinaryConfigrations.js";
import { subCategoryModel } from "../../../DB/Models/subCategory.model.js";
import { brandModel } from "../../../DB/Models/brand.model.js";
import { productModel } from "../../../DB/Models/product.model.js";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("123456_=!ascbhdtel", 5);
//MARK: add category
export const addCategory = async (req, res, next) => {
  const { _id } = req.user;
  const { name } = req.body;
  const found = await categoryModel.findOne({ name });
  if (found) return next(new Error("Category already exists", { cause: 436 }));
  const slug = slugify(name, "_");
  if (!req.file) return next(new Error("Image is required", { cause: 436 }));
  const customId = nanoid();
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.PROJECT_FOLDER}/category/${customId}`,
    }
  );
  const category = await categoryModel.create({
    name,
    slug,
    image: { secure_url, public_id },
    customId,
    createdBy: _id,
  });
  if (!category) {
    await cloudinary.uploader.destroy(public_id);
    return next(new Error("Category not created", { cause: 500 }));
  }
  res.status(201).json({ message: "category created succesfully", category });
};
//MARK: update category
export const updateCategory = async (req, res, next) => {
  const { _id } = req.user;
  const { categoryId } = req.params;
  const name = req.body.name.toLowerCase();
  const found = await categoryModel.findOne({
    _id: categoryId,
  });
  if (!found) return next(new Error("Category not found", { cause: 404 }));
  if (JSON.stringify(found.createdBy) != JSON.stringify(_id))
    return next(
      new Error("You are not authorized to update this category", {
        cause: 436,
      })
    );
  if (name) {
    const sname = await categoryModel.findOne({
      name,
      _id: { $ne: categoryId },
    });
    const slug = slugify(name, "_");
    if (sname)
      return next(new Error("Category already exists", { cause: 436 }));
    found.name = name;
    found.slug = slug;
  }
  if (req.file) {
    // delete previous image
    await cloudinary.uploader.destroy(found.image.public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.PROJECT_FOLDER}/category/${found.customId}`,
      }
    );
    found.image = { secure_url, public_id };
  }
  found.updatedBy = _id;
  await found.save();
  res.status(200).json({ message: "category updated succesfully", found });
};
export const getAdminCategories = async (req, res, next) => {
  const { _id } = req.user;
  const categories = await categoryModel.find({ createdBy: _id });
  if (!categories)
    return next(new Error("Categories not found", { cause: 404 }));
  res.status(200).json({ categories });
};
//MARK: get all categories
export const getAllCategories = async (req, res, next) => {
  const categories = await categoryModel.find().populate({
    path: "subCategories",
    populate: {
      path: "brands",
      populate: {
        path: "products",
      },
    },
  });
  if (!categories)
    return next(new Error("Categories not found", { cause: 404 }));
  res.status(200).json({ categories });
};
//MARK: delete category
export const deleteCategory = async (req, res, next) => {
  const { _id } = req.user;
  const { categoryId } = req.query;
  const found = await categoryModel.findById(categoryId);

  if (!found) return next(new Error("Category not found", { cause: 404 }));
  if (
    JSON.stringify(found.createdBy) != JSON.stringify(_id) &&
    req.user.role != "SuperAdmin"
  )
    return next(
      new Error("You are not authorized to update this category", {
        cause: 401,
      })
    );

  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.PROJECT_FOLDER}/category/${found.customId}`
  );
  await cloudinary.api.delete_folder(
    `${process.env.PROJECT_FOLDER}/category/${found.customId}`
  );
  const deletedSubCategories = await subCategoryModel.deleteMany({
    categoryId,
  });
  const deletedBrands = await brandModel.deleteMany({ categoryId });
  const deletedProducts = await productModel.deleteMany({ categoryId });
  await categoryModel.findByIdAndDelete(categoryId);
  if (!deletedProducts)
    return next(new Error("Category not deleted", { cause: 500 }));
  if (!deletedSubCategories)
    return next(new Error("SubCategories not deleted", { cause: 500 }));
  if (!deletedBrands)
    return next(new Error("Brands not deleted", { cause: 500 }));

  res.status(200).json({ message: "Category deleted succesfully" });
};
