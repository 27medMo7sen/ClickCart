import { Schema, model } from "mongoose";
export const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    discount: {
      type: Number,
      required: true,
      default: 1,
    },
    expireAt: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    usedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const couponModel = model("Coupon", couponSchema);
