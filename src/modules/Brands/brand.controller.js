import { subCategoryModel } from "../../../DB/Models/subCategory.model.js";
import { categoryModel } from "../../../DB/Models/category.model.js";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("123456_=!ascbhdtel", 5);
import slugify from "slugify";
import cloudinary from "../../utils/coludinaryConfigrations.js";
import { brandModel } from "../../../DB/Models/brand.model.js";
import { productModel } from "../../../DB/Models/product.model.js";
//MARK: add brand
export const addBrand = async (req, res, next) => {
  const { _id } = req.user;
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
    createdBy: _id,
    subCategoryId,
    customId,
  });
  if (!brand) {
    await cloudinary.uploader.destroy(public_id);
    return next(new Error("Brand not created", { cause: 500 }));
  }
  res.status(201).json({ message: "Brand created succesfully", brand });
};
//MARK: update brand
export const updateBrand = async (req, res, next) => {
  const { _id } = req.user;
  const { categoryId, subCategoryId, brandId } = req.query;
  const { name } = req.body;
  const brand = await brandModel.findById(brandId);
  const category = await categoryModel.findById(categoryId);
  const subCategory = await subCategoryModel.findById(subCategoryId);

  let preImage;
  if (!brand) return next(new Error("Brand not found", { cause: 404 }));
  if (name) {
    const slug = slugify(name, {
      lower: true,
      replacement: "_",
    });
    brand.name = name;
    brand.slug = slug;
  }
  if (req.file) {
    preImage = { ...brand.logo };
    await cloudinary.uploader.destroy(brand.logo.public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.PROJECT_FOLDER}/category/${category.customId}/subCategory/${subCategory.customId}/brand/${brand.customId}`,
      }
    );
    brand.logo = { secure_url, public_id };
  }
  brand.updatedBy = _id;
  const updatedBrand = await brand.save();
  if (!updatedBrand) {
    await cloudinary.uploader.destroy(public_id);
    await cloudinary.uploader.upload(
      {
        secure_url: preImage.secure_url,
      },
      {
        public_id: preImage.public_id,
      }
    );
    return next(new Error("Brand not updated", { cause: 500 }));
  }
  res.status(200).json({ message: "Brand updated succesfully", updatedBrand });
};
//MARK: delete brand
export const deleteBrand = async (req, res, next) => {
  const { brandId } = req.query;
  const brand = await brandModel.findById(brandId);
  if (!brand) return next(new Error("Brand not found", { cause: 404 }));
  const category = await categoryModel.findById(brand.categoryId);
  const subCategory = await subCategoryModel.findById(brand.subCategoryId);
  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.PROJECT_FOLDER}/category/${category.customId}/subCategory/${subCategory.customId}/brand/${brand.customId}`
  );
  await cloudinary.api.delete_folder(
    `${process.env.PROJECT_FOLDER}/category/${category.customId}/subCategory/${subCategory.customId}/brand/${brand.customId}`
  );
  await productModel.deleteMany({ brandId });
  await brandModel.findByIdAndDelete(brandId);
  res.status(200).json({ message: "Brand deleted succesfully" });
};
//MARK: get brands
export const getBrands = async (req, res, next) => {
  const brands = await brandModel.find().populate({
    path: "products",
  });
  if (!brands) return next(new Error("Brands not found", { cause: 404 }));
  res.status(200).json({ brands });
};
