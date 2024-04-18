//MARK: add order
import { validateCoupon } from "../../utils/couponValidation.js";
import { productModel } from "../../../DB/Models/product.model.js";
import { orderModel } from "../../../DB/Models/order.model.js";
import { cartModel } from "../../../DB/Models/cart.model.js";
export const addOrder = async (req, res, next) => {
  const userId = req.user._id;
  const {
    productId,
    quantity,
    phoneNumbers,
    address,
    paymentMethod,
    couponCode,
  } = req.body;
  let ret;
  if (couponCode) {
    ret = await validateCoupon(couponCode, userId);
    if (ret.valid == false) return next(new Error(ret.message, { cause: 400 }));
  }
  const ifProductValid = await productModel.findById({
    _id: productId,
    stock: { $gte: quantity },
  });
  if (!ifProductValid)
    return next(new Error("Product not found", { cause: 404 }));
  let products = [];
  const productObject = {
    productId,
    quantity,
    title: ifProductValid.name,
    price: ifProductValid.priceAfterDiscount,
    finalPrice: ifProductValid.priceAfterDiscount * quantity,
  };
  products.push(productObject);
  let subTotal = 0;
  subTotal += Number(ifProductValid.priceAfterDiscount) * quantity;
  let paidAmount = subTotal;
  if (couponCode && ret.valid) {
    if (ret.isPercentage) {
      paidAmount = subTotal - (subTotal * ret.amount) / 100;
    } else paidAmount = subTotal - ret.amount > 0 ? subTotal - ret.amount : 0;
  } else paidAmount = subTotal;
  const order = await orderModel.create({
    userId,
    products,
    phoneNumbers,
    address,
    paymentMethod,
    couponId: couponCode ? couponCode : null,
    subTotal: subTotal,
    paidAmount,
  });
  if (!order) return next(new Error("Fail to add order", { cause: 400 }));
  await productModel.findByIdAndUpdate(productId, {
    stock: ifProductValid.stock - quantity,
  });
  const cart = await cartModel.findOne({ userId });
  let productsArr = [],
    pro = {},
    subTotalCart = cart.subTotal;
  if (cart) {
    for (const product of cart.products) {
      const productDB = await productModel.findById(product.productId);
      if (product.productId == productId) {
        pro = JSON.parse(JSON.stringify(product));
        subTotalCart -=
          Number(productDB.priceAfterDiscount) * Number(pro.quantity);
        pro.quantity -= quantity;
        if (pro.quantity > 0) {
          productsArr.push(pro);
          subTotalCart =
            Number(productDB.priceAfterDiscount) * Number(pro.quantity);
        }
      }
    }
  }
  cart.products = productsArr;
  cart.subTotal = subTotalCart;
  await cart.save();
  res.status(201).json({ message: "Order added successfully", order });
};
