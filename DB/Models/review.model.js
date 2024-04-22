import { Schema, model } from "mongoose";
export const reviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    review: {
      type: String,
    },
    rating: {
      min: 1,
      max: 5,
      defualt: 1,
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const reviewModel = model("Review", reviewSchema);
