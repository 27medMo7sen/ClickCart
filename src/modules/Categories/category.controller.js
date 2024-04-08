import slugify from "slugify";
import { categoryModel } from "../../../DB/Models/category.model.js";
import cloudinary from "../../utils/coludinaryConfigrations.js";
import { customAlphabet } from "nanoid";
import { subCategoryModel } from "../../../DB/Models/subCategory.model.js";
import { brandModel } from "../../../DB/Models/brand.model.js";
import { productModel } from "../../../DB/Models/product.model.js";
const nanoid = customAlphabet("123456_=!ascbhdtel", 5);

export const addCategory = async (req, res, next) => {
  const { _id } = req.user;
  const { name } = req.body;
  const found = await categoryModel.findOne({ name });
  if (found) return next(new Error("Category already exists", { cause: 400 }));
  const slug = slugify(name, "_");
  if (!req.file) return next(new Error("Image is required", { cause: 400 }));
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
export const updateCategory = async (req, res, next) => {
  const { _id } = req.user;
  const { categoryId } = req.params;
  const name = req.body.name.toLowerCase();
  const found = await categoryModel.findOne({
    _id: categoryId,
    createdBy: _id,
  });
  console.log(_id);
  if (!found) return next(new Error("Category not found", { cause: 404 }));
  if (name) {
    if (found.name === name)
      return next(new Error("Please pick different name", { cause: 400 }));
    const sname = await categoryModel.findOne({ name });
    const slug = slugify(name, "_");
    if (sname)
      return next(new Error("Category already exists", { cause: 400 }));
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
export const deleteCategory = async (req, res, next) => {
  const { _id } = req.user;
  const { categoryId } = req.query;
  const found = await categoryModel.findOne({ categoryId, craetedBy: _id });
  if (!found) return next(new Error("Category not found", { cause: 404 }));
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
  console.log(deletedSubCategories, deletedBrands);
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
