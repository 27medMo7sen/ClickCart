import slugify from "slugify";
import { categoryModel } from "../../../DB/Models/category.model.js";
import cloudinary from "../../utils/coludinaryConfigrations.js";
import { customAlphabet } from "nanoid";
import { subCategoryModel } from "../../../DB/Models/subCategory.model.js";
const nanoid = customAlphabet("123456_=!ascbhdtel", 5);

export const createCategory = async (req, res, next) => {
  const { name, _id } = req.body;
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
  });
  if (!category) {
    await cloudinary.uploader.destroy(public_id);
    return next(new Error("Category not created", { cause: 500 }));
  }
  res.status(201).json({ message: "category created succesfully", category });
};
export const updateCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  const name = req.body.name.toLowerCase();
  const found = await categoryModel.findById(categoryId);
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
  await found.save();
  res.status(200).json({ message: "category updated succesfully", found });
};
export const getAllCategories = async (req, res, next) => {
  const categories = await categoryModel
    .find()
    .select("name slug image customId");
  if (!categories)
    return next(new Error("Categories not found", { cause: 404 }));
  let subCategoriesArr = [];
  let cateogriesArray = [];
  for (let category of categories) {
    subCategoriesArr = await subCategoryModel.find({
      categoryId: category._id,
    });
    let obCategory = category.toObject();
    obCategory.subCategories = subCategoriesArr;
    cateogriesArray.push(obCategory);
  }
  res.status(200).json({ categories: cateogriesArray });
};
