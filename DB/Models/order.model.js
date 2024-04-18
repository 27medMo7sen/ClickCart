import { mongoose, model, Schema } from "mongoose";
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    products: [
      {
        productId: {
          type: String,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        title: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        finalPrice: {
          type: Number,
          required: true,
        },
      },
    ],
    subTotal: {
      type: Number,
      required: true,
    },
    couponId: {
      type: String,
      ref: "Coupon",
    },
    paidAmount: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumbers: [
      {
        type: String,
        required: true,
      },
    ],
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "card"],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reason: String,
  },
  { timestamps: true }
);
export const orderModel = model("Order", orderSchema);
