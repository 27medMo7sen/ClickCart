import { couponModel } from "../../../DB/Models/coupon.model.js";
import { productModel } from "../../../DB/Models/product.model.js";
import { categoryModel } from "../../../DB/Models/category.model.js";
import { subCategoryModel } from "../../../DB/Models/subCategory.model.js";
import { brandModel } from "../../../DB/Models/brand.model.js";
import slugify from "slugify";
import { customAlphabet } from "nanoid";
import { pagination } from "../../utils/pagination.js";
import cloudinary from "../../utils/coludinaryConfigrations.js";
const nanoid = customAlphabet("123456_=!ascbhdtel", 5);
//============================================== createCoupon ==============================================
