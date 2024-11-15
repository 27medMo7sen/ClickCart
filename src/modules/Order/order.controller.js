//MARK: add order
import { validateCoupon } from "../../utils/couponValidation.js";
import { productModel } from "../../../DB/Models/product.model.js";
import { orderModel } from "../../../DB/Models/order.model.js";
import { cartModel } from "../../../DB/Models/cart.model.js";
import { customAlphabet } from "nanoid";
import createInvoice from "../../utils/pdfkit.js";
import { sendEmailService } from "../../services/sendEmailService.js";
import { generateQrCode } from "../../utils/qrCodeFunction.js";
import { paymentFunction } from "../../utils/payment.js";
import { generateToken, verifyToken } from "../../utils/tokenFunctions.js";
import { couponModel } from "../../../DB/Models/coupon.model.js";
import Stripe from "stripe";
const nanoid = customAlphabet("123456_=!ascbhdtel", 5);
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
  });
  if (!ifProductValid || ifProductValid.stock < quantity)
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
    } else {
      if (subTotal - ret.amount < 0)
        return next(
          new Error("Coupon amount is greater than the total amount", {
            cause: 400,
          })
        );
      paidAmount = subTotal - ret.amount;
    }
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
  let orderSession;
  const token = generateToken({
    payload: { orderId: order._id },
    signature: process.env.ORDER_TOKEN,
    expiresIn: "1d",
  });
  let coupon;
  if (order.paymentMethod === "card") {
    if (req.couponCode && ret.valid) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      if (ret.isPercentage) {
        coupon = await stripe.coupons.create({
          percent_off: ret.amount,
        });
      } else {
        coupon = await stripe.coupons.create({
          amount_off: ret.amount * 100,
          currency: "EGP",
        });
      }
      req.couponId = coupon.id;
    }
    console.log(
      `${req.protocol}://${req.headers.host}/order/cancel?token=${token}`
    );
    orderSession = await paymentFunction({
      payment_method_types: ["card"],
      mood: "payment",
      customer_email: req.user.email,
      metadata: { orderId: order._id.toString() },
      success_url: `${req.protocol}://${req.headers.host}/order/success?token=${token}`, //${process.env.CLIENT_URL}
      cancel_url: `${req.protocol}://${req.headers.host}/order/cancel?token=${token}`,
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "EGP",
            product_data: {
              name: product.title,
            },
            unit_amount: product.price * 100,
          },
          quantity: product.quantity,
        };
      }),
      discounts: req.couponId ? [{ coupon: req.couponId }] : [],
    });
  }
  if (req.couponCode && ret.valid) {
    console.log(coupon.id);
  }
  await productModel.findByIdAndUpdate(productId, {
    stock: ifProductValid.stock - quantity,
  });
  const cart = await cartModel.findOne({ userId });
  let productsArr = [],
    pro = {},
    subTotalCart = 0;
  if (cart) {
    subTotalCart = cart.subTotal;
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
    cart.products = productsArr;
    cart.subTotal = subTotalCart;
    await cart.save();
  }
  const orderCode = `${req.user.userName}_${nanoid()}`;
  const orderInvoice = {
    shipping: {
      name: req.user.userName,
      address: order.address,
      city: "Fayoum",
      state: "Fayoum",
      country: "Egypt",
    },
    orderCode,
    date: order.createdAt,
    items: order.products,
    subTotal: order.subTotal,
    paidAmount: order.paidAmount,
  };
  // await createInvoice(orderInvoice, `${orderCode}.pdf`);
  // await sendEmailService({
  //   to: req.user.email,
  //   subject: "Order Invoice",
  //   message: `<h1>please check your invoice pdf below</h1>`,
  //   attachments: [
  //     {
  //       filename: `${orderCode}.pdf`,
  //       path: `./Files/${orderCode}.pdf`,
  //     },
  //   ],
  // });
  console.log("here");

  const QRCode = await generateQrCode({
    data: { orderId: order._id, products: order.products },
  });
  res.status(201).json({
    message: "Order added successfully",
    order,
    checkOutUrl: orderSession.url,
  });
};
//MARK: cart to order
export const cartToOrder = async (req, res, next) => {
  const { phoneNumbers, address, paymentMethod, couponCode } = req.body;
  const userId = req.user._id;
  const { cartId } = req.query;
  const cart = await cartModel.findById(cartId);
  if (!cart || !cart.products)
    return next(new Error("Cart not found", { cause: 404 }));
  let ret;
  if (couponCode) {
    ret = await validateCoupon(couponCode, userId);
    if (ret.valid == false) return next(new Error(ret.message, { cause: 400 }));
  }
  for (const product of cart.products) {
    const ifProductValid = await productModel.findById({
      _id: product.productId,
      stock: { $gte: product.quantity },
    });
    if (!ifProductValid)
      return next(new Error("Product not found", { cause: 404 }));
  }
  let products = [];
  let subTotal = cart.subTotal;
  let paidAmount = subTotal;
  if (couponCode && ret.valid) {
    if (ret.isPercentage) {
      paidAmount = subTotal - (subTotal * ret.amount) / 100;
    } else paidAmount = subTotal - ret.amount > 0 ? subTotal - ret.amount : 0;
  } else paidAmount = subTotal;
  for (const product of cart.products) {
    const productDB = await productModel.findById(product.productId);
    const productObject = {
      productId: product.productId,
      quantity: product.quantity,
      title: productDB.name,
      price: productDB.priceAfterDiscount,
      finalPrice: productDB.priceAfterDiscount * product.quantity,
    };
    products.push(productObject);
  }
  const order = await orderModel.create({
    userId,
    products,
    phoneNumbers,
    address,
    paymentMethod,
    couponId: couponCode ? couponCode : null,
    subTotal,
    paidAmount,
  });
  if (!order) return next(new Error("Fail to add order", { cause: 400 }));
  for (const product of cart.products) {
    await productModel.findByIdAndUpdate(product.productId, {
      $inc: { stock: parseInt(-product.quantity) },
    });
  }
  cart.products = [];
  cart.subTotal = 0;
  await cart.save();
  res.status(201).json({ message: "Order added successfully", order });
};
//MARK: success payment
export const successPayment = async (req, res, next) => {
  const { token } = req.query;
  const decodedData = verifyToken({
    token,
    signature: process.env.ORDER_TOKEN,
  });
  const order = await orderModel.findOne({
    _id: decodedData.orderId,
    status: "pending",
  });
  if (!order) return next(new Error("Order not found", { cause: 404 }));
  order.status = "confirmed";
  await order.save();
  res.status(200).json({ message: "Order confirmed successfully", order });
};
//MARK: cancel payment
export const cancelPayment = async (req, res, next) => {
  const { token } = req.query;
  console.log(token);
  const decodedData = verifyToken({
    token,
    signature: process.env.ORDER_TOKEN,
  });
  const order = await orderModel.findOne({
    _id: decodedData.orderId,
    status: "pending",
  });
  if (!order) return next(new Error("Order not found", { cause: 404 }));
  order.status = "cancelled";
  await order.save();
  const products = order.products;
  for (const product of products) {
    await productModel.findByIdAndUpdate(product.productId, {
      $inc: { stock: parseInt(product.quantity) },
    });
  }
  if (order.couponId) {
    const coupon = await couponModel.findOne({ couponCode: order.couponId });
    for (const user of coupon.couponAssginedToUsers) {
      if (String(user.userId) == String(order.userId)) {
        user.used -= 1;
        break;
      }
    }
    await coupon.save();
  }
  res.status(200).json({ message: "Order cancelled successfully", order });
};
export const deliverOrder = async (req, res, next) => {
  const { orderId } = req.query;
  const order = await orderModel.findOne({
    _id: orderId,
    status: { $nin: ["delivered", "cancelled", "peinding", "rejected"] },
  });
  if (!order) return next(new Error("Order not found", { cause: 404 }));
  order.status = "delivered";
  await order.save();
  res.status(200).json({ message: "Order delivered successfully", order });
};
