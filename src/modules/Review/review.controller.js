import { productModel } from "../../../DB/Models/product.model.js";
import { orderModel } from "../../../DB/Models/order.model.js";
import { reviewModel } from "../../../DB/Models/review.model.js";
//MARK: add review
export const addReview = async (req, res, next) => {
  const { _id } = req.user;
  const { rating, review } = req.body;
  const { productId } = req.query;
  const product = await productModel.findById(productId);
  if (!product) return next(new Error("Product not found", { cause: 404 }));
  const order = await orderModel.findOne({
    userId: _id,
    "products.productId": productId,
    status: "delivered",
  });
  if (!order)
    return next(
      new Error("You should try the product to rewiew it", { cause: 400 })
    );
  const reviewDB = await reviewModel.create({
    userId: _id,
    productId,
    review,
    rating,
  });
  if (!reviewDB) return next(new Error("Fail to add review", { cause: 400 }));
  product.ratingSum = product.ratingSum + rating;
  product.noOfRatings = product.noOfRatings + 1;
  product.productRating = Number(
    product.ratingSum / product.noOfRatings
  ).toFixed(1);
  product.save();
  res.status(201).json({ reviewDB, product });
};
