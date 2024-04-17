import { cartModel } from "../../../DB/Models/cart.model.js";
import { productModel } from "../../../DB/Models/product.model.js";
//MARK: add to cart
export const addToCart = async (req, res, next) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;
  const product = await productModel.findById(productId);
  console.log("hello");
  if (!product) return next(new Error("Product not found", { cause: 404 }));
  if (product.stock < quantity)
    return next(new Error("Quantity not available", { cause: 400 }));
  const cart = await cartModel.findOne({ userId });
  if (!cart) {
    const cartObject = {
      userId,
      products: [{ productId, quantity }],
      subTotal: product.price * quantity,
    };
    const cartDb = await cartModel.create(cartObject);
    if (!cartDb) return next(new Error("Fail to add to cart", { cause: 400 }));
    await productModel.findByIdAndUpdate(productId, {
      stock: product.stock - quantity,
    });
    return res.status(201).json({ message: "Added to cart", cartDb });
  }

  let products = cart.products;
  let flag = false;
  for (const product of products) {
    if (product.productId == productId) {
      product.quantity += quantity;
      flag = true;
    }
  }
  if (!flag) {
    products.push({ productId, quantity });
  }
  let subTotal = 0;
  for (const product of products) {
    const productDb = await productModel.findById(product.productId);
    subTotal += productDb.price * product.quantity;
  }
  cart.subTotal = subTotal;
  cart.products = products;
  const cartDb = await cart.save();
  if (!cartDb) return next(new Error("Fail to add to cart", { cause: 400 }));
  await productModel.findByIdAndUpdate(productId, {
    stock: product.stock - quantity,
  });
  res.status(201).json({ message: "Added to cart", cartDb });
};
export const deleteFromTheCart = async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.user._id;
  const cart = await cartModel.findOne({ userId });
  const product = await productModel.findById(productId);
  if (!product) return next(new Error("Product not found", { cause: 404 }));
  if (!cart) return next(new Error("Cart not found", { cause: 404 }));
  let products = cart.products;
  let flag = false;
  let quantity = 0;
  for (const product of products) {
    if (String(product.productId) == String(productId)) {
      products = products.filter((product) => product.productId != productId);
      quantity = product.quantity;
      flag = true;
    }
  }
  if (!flag)
    return next(new Error("Product not found in cart", { cause: 404 }));
  let subTotal = 0;
  for (const product of products) {
    const productDb = await productModel.findById(product.productId);
    subTotal += productDb.price * product.quantity;
  }
  cart.subTotal = subTotal;
  cart.products = products;
  const cartDb = await cart.save();
  if (!cartDb)
    return next(new Error("Fail to delete from cart", { cause: 400 }));

  await productModel.findByIdAndUpdate(productId, {
    stock: product.stock + quantity,
  });
  res.status(200).json({ message: "Deleted from cart", cartDb });
};
