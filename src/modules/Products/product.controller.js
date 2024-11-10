import { productModel } from "../../../DB/Models/product.model.js";
import { categoryModel } from "../../../DB/Models/category.model.js";
import { subCategoryModel } from "../../../DB/Models/subCategory.model.js";
import { brandModel } from "../../../DB/Models/brand.model.js";
import slugify from "slugify";
import { customAlphabet } from "nanoid";
import { paginationFunciton } from "../../utils/pagination.js";
import cloudinary from "../../utils/coludinaryConfigrations.js";
import { apiFeatures } from "../../utils/apiFeatures.js";
const nanoid = customAlphabet("123456_=!ascbhdtel", 5);
//MARK: add product
export const addProduct = async (req, res, next) => {
  const { _id } = req.user;
  const { name, price, desc, stock, colors, sizes, appliedDiscount } = req.body;
  const { categoryId, subCategoryId, brandId } = req.query;
  const category = await categoryModel.findById(categoryId);
  if (!category) return next(new Error("Category not found", { cause: 400 }));
  const subCategory = await subCategoryModel.findById(subCategoryId);
  if (!subCategory)
    return next(new Error("SubCategory not found", { cause: 400 }));
  const brand = await brandModel.findById(brandId);
  if (!brand) return next(new Error("Brand not found", { cause: 400 }));
  const slug = slugify(name, "_");
  if (!req.files) return next(new Error("Images are required", { cause: 400 }));
  const priceAfterDiscount = price - (price * (appliedDiscount || 0)) / 100;
  const customId = nanoid();
  const images = [];
  const puplicIds = [];
  for (const file of req.files) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `${process.env.PROJECT_FOLDER}/category/${category.customId}/subCategory/${subCategory.customId}/brand/${brand.customId}/product/${customId}`,
      }
    );
    images.push({ secure_url, public_id });
    puplicIds.push(public_id);
  }
  req.imagesPath = `${process.env.PROJECT_FOLDER}/category/${category.customId}/subCategory/${subCategory.customId}/brand/${brand.customId}/product/${customId}`;
  req.customId = customId;
  const newProduct = await productModel.create({
    name,
    slug,
    price,
    priceAfterDiscount,
    createdBy: _id,
    desc,
    stock,
    images,
    colors,
    sizes,
    appliedDiscount,
    categoryId,
    subCategoryId,
    brandId,
    customId,
  });
  if (!newProduct) {
    await cloudinary.api.delete_resources(puplicIds);
    return next(new Error("Product not created", { cause: 500 }));
  }
  res.status(201).json(newProduct);
};
//MARK: update product
export const updateProduct = async (req, res, next) => {
  const { productId } = req.query;
  const { _id } = req.user;
  const {
    name,
    price,
    desc,
    stock,
    colors,
    sizes,
    appliedDiscount,
    oldImages,
  } = req.body;
  const product = await productModel.findById(productId);
  if (!product) return next(new Error("Product not found", { cause: 404 }));
  if (JSON.stringify(product.createdBy) != JSON.stringify(_id))
    return next(
      new Error("You are not authorized to update this product", { cause: 401 })
    );
  const { categoryId, subCategoryId, brandId } = product;
  const category = await categoryModel.findById(categoryId);
  const subCategory = await subCategoryModel.findById(subCategoryId);
  const brand = await brandModel.findById(brandId);
  if (price && appliedDiscount)
    (product.priceAfterDiscount =
      price - (price * (appliedDiscount || 0)) / 100),
      (product.price = price);
  else if (price)
    (product.priceAfterDiscount =
      price - (price * (product.appliedDiscount || 0)) / 100),
      (product.price = price);
  else if (appliedDiscount)
    product.priceAfterDiscount =
      product.price - (product.price * (appliedDiscount || 0)) / 100;
  if (name) {
    const slug = slugify(name, "_");
    product.name = name;
    product.slug = slug;
  }
  if (desc) product.desc = desc;
  if (stock) product.stock = stock;
  if (colors) product.colors = colors;
  if (sizes) product.sizes = sizes;
  product.updatedBy = _id;
  const images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.PROJECT_FOLDER}/category/${category.customId}/subCategory/${subCategory.customId}/brand/${brand.customId}/product/${product.customId}`,
        }
      );
      images.push({ secure_url, public_id });
    }
  }
  for (const image of product.images) {
    if (!oldImages.includes(image.secure_url)) {
      console.log(true);
      await cloudinary.api.delete_resources(image.public_id);
    } else images.push(image);
  }
  product.images = images;
  const updatedProduct = await product.save();
  if (!updatedProduct)
    return next(new Error("Product not updated", { cause: 500 }));
  res.status(200).json(updatedProduct);
};
//MARK: get all products
export const getAllProducts = async (req, res, next) => {
  const { page, size } = req.query;
  const { limit, skip } = paginationFunciton(page, size);
  const products = await productModel
    .find()
    .limit(limit)
    .skip(skip)
    .populate([
      {
        path: "Reviews",
      },
    ]);
  if (!products) return next(new Error("Products not found", { cause: 404 }));
  res.status(200).json(products);
};
//MARK: get product by name
export const getProductsByName = async (req, res, next) => {
  const { name, page, size } = req.query;
  const { limit, skip } = paginationFunciton(page, size);
  const products = await productModel
    .find({
      $or: [
        { name: { $regex: name, $options: "i" } },
        { desc: { $regex: name, $options: "i" } },
      ],
    })
    .limit(limit)
    .skip(skip)
    .populate([
      {
        path: "Review",
      },
    ]);
  if (!products) return next(new Error("Products not found", { cause: 404 }));
  res.status(200).json(products);
};
//MARK: delete product
export const deleteProduct = async (req, res, next) => {
  const { _id } = req.user;
  const { productId } = req.query;
  const product = await productModel.findById(productId);
  if (!product) return next(new Error("Product not found", { cause: 404 }));
  if (JSON.stringify(product.createdBy) != JSON.stringify(_id))
    return next(
      new Error("You are not authorized to update this product", { cause: 401 })
    );
  const customId = product.customId;
  const { categoryId, subCategoryId, brandId } = product;
  const category = await categoryModel.findById(categoryId);
  const subCategory = await subCategoryModel.findById(subCategoryId);
  const brand = await brandModel.findById(brandId);
  const deletedProduct = await productModel.findByIdAndDelete(productId);
  if (!deletedProduct)
    return next(new Error("Product not deleted", { cause: 500 }));
  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.PROJECT_FOLDER}/category/${category.customId}/subCategory/${subCategory.customId}/brand/${brand.customId}/product/${customId}`
  );
  await cloudinary.api.delete_folder(
    `${process.env.PROJECT_FOLDER}/category/${category.customId}/subCategory/${subCategory.customId}/brand/${brand.customId}/product/${customId}`
  );
  res.status(200).json(deletedProduct);
};
//MARK: product filter
export const listProducts = async (req, res, next) => {
  const apiFeaturesInstance = new apiFeatures(productModel.find(), req.query)
    .pagination()
    .sort()
    .select()
    .search()
    .filter();
  const products = await apiFeaturesInstance.mongooseQuery.populate([
    {
      path: "Reviews",
    },
  ]);
  if (!products) return next(new Error("Products not found", { cause: 404 }));
  res.status(200).json(products);
};
//MARK: search product by admin
export const searchAdminProducts = async (req, res, next) => {
  const { _id } = req.user;
  const { categoryId, subCategoryId, brandId, name } = req.query;
  const products = await productModel.find({
    createdBy: _id,
    categoryId,
    subCategoryId,
    brandId,
    name: { $regex: name, $options: "i" },
  });
  res.status(200).json({ products });
};
