import { productModel } from "../../../DB/Models/product.model.js";
import { categoryModel } from "../../../DB/Models/category.model.js";
import { subCategoryModel } from "../../../DB/Models/subCategory.model.js";
import { brandModel } from "../../../DB/Models/brand.model.js";
import slugify from "slugify";
import { customAlphabet } from "nanoid";
import { pagination } from "../../utils/pagination.js";
import cloudinary from "../../utils/coludinaryConfigrations.js";
import match from "nodemon/lib/monitor/match.js";
const nanoid = customAlphabet("123456_=!ascbhdtel", 5);

export const createProduct = async (req, res) => {
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
    customId,
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
export const updateProduct = async (req, res, next) => {
  const { productId } = req.query;
  const { name, price, desc, stock, colors, sizes, appliedDiscount } = req.body;
  const product = await productModel.findById(productId);
  if (!product) return next(new Error("Product not found", { cause: 404 }));
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
    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }
  }
  product.images = images;
  const updatedProduct = await product.save();
  if (!updatedProduct)
    return next(new Error("Product not updated", { cause: 500 }));
  res.status(200).json(updatedProduct);
};
export const getAllProducts = async (req, res, next) => {
  const { page, size } = req.query;
  const { limit, skip } = pagination(page, size);
  const products = await productModel.find().limit(limit).skip(skip);
  if (!products) return next(new Error("Products not found", { cause: 404 }));
  res.status(200).json(products);
};
export const getProductsByName = async (req, res, next) => {
  const { name, page, size } = req.query;
  const { limit, skip } = pagination(page, size);
  const products = await productModel
    .find({
      $or: [
        { name: { $regex: name, $options: "i" } },
        { desc: { $regex: name, $options: "i" } },
      ],
    })
    .limit(limit)
    .skip(skip);
  if (!products) return next(new Error("Products not found", { cause: 404 }));
  res.status(200).json(products);
};
export const deleteProduct = async (req, res, next) => {
  const { productId } = req.query;
  const product = await productModel.findById(productId);
  if (!product) return next(new Error("Product not found", { cause: 404 }));
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
export const listProducts = async (req, res, next) => {
  //================= sort ===============
  // const {sort}=req.query;
  // const products = await productModel.find().sort(sort.replaceAll(","," "));
  // if (!products) return next(new Error("Products not found", { cause: 404 }));
  // res.status(200).json(products);
  //================= select ===============
  // const { select } = req.query;
  // const products = await productModel
  //   .find()
  //   .select(select.replaceAll(",", " "));
  // if (!products) return next(new Error("Products not found", { cause: 404 }));
  // res.status(200).json(products);
  //================= search ==============
  // const { search } = req.query;
  // const products = await productModel
  //   .find({
  //     $or: [
  //       { name: { $regex: search, $options: "i" } },
  //       { desc: { $regex: search, $options: "i" } },
  //     ],
  //   })
  //======================= filter ========================
  const excludeFields = ["page", "sort", "limit", "select", "search"];
  excludeFields.forEach((key) => delete queryInstance[key]);
  const queryInstance = { ...req.query };
  console.log(queryInstance);
  const queryString = JSON.parse(
    JSON.stringify(queryInstance).replace(
      /lte|gte|gt|lt|regex|in|nin|eq|neq/g,
      (match) => `$${match}`
    )
  );
  console.log(queryString);
  const products = await productModel.find(queryString);
  if (!products) return next(new Error("Products not found", { cause: 404 }));
  res.status(200).json(products);
};
