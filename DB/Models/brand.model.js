import { Schema, model } from "mongoose";
export const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    logo: {
      secure_url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "subCategory",
      required: true,
    },
    customId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
brandSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "brandId",
});
export const brandModel = model("Brand", brandSchema);
