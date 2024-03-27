import { couponModel } from "../../../DB/Models/coupon.model.js";
import moment from "moment";
//============================================== createCoupon ==============================================
export const createCoupon = async (req, res, next) => {
  const { code, createdAt, expireAt, discount } = req.body;
  const found = await couponModel.findOne({ code: code.toLowerCase() });

  if (found)
    return res.status(400).json({ message: "Coupon Code Already Exists" });
  const createdAtMoment = moment(new Date(createdAt)).format(
    "YYYY-MM-DD HH:mm:ss"
  );
  const expireAtMoment = moment(new Date(expireAt)).format(
    "YYYY-MM-DD HH:mm:ss"
  );
  const now = moment().format("YYYY-MM-DD HH:mm:ss");
  if (
    moment(createdAtMoment).isSameOrAfter(moment(expireAtMoment)) ||
    moment(now).isSameOrAfter(moment(expireAtMoment)) ||
    moment(now).isAfter(moment(createdAtMoment))
  )
    return next(new Error("Invalid Dates", { cause: 400 }));
  if (discount < 0 || discount > 100)
    return next(new Error("Invalid Discount", { cause: 400 }));
  const coupon = await couponModel.create({
    code,
    createdAt: createdAtMoment,
    expireAt: expireAtMoment,
    discount,
  });
  if (!coupon) return next(new Error("Coupon not created", { cause: 500 }));
  res.status(201).json({ message: "Coupon created succesfully", coupon });
};
//============================================== updateCoupon ==============================================
export const updateCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const { code, discount, createdAt, expireAt } = req.body;
  const found = await couponModel.findById({ _id: couponId });
  if (!found) return next(new Error("Coupon not found", { cause: 404 }));
  if (code) {
    if (code == found.code)
      return next(new Error("Coupon Code Already Exists", { cause: 400 }));
    const foundCode = await couponModel.findOne({ code: code.toLowerCase() });
    if (foundCode)
      return next(new Error("Coupon Code Already Exists", { cause: 400 }));
    found.code = code;
  }
  if (discount < 0 || discount > 100)
    return next(new Error("Invalid Discount", { cause: 400 }));
  found.discount = discount;
  if (createdAt && expireAt) {
    const createdAtMoment = moment(new Date(createdAt)).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    const expireAtMoment = moment(new Date(expireAt)).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    const now = moment().format("YYYY-MM-DD HH:mm:ss");
    if (
      moment(createdAtMoment).isSameOrAfter(moment(expireAtMoment)) ||
      moment(now).isSameOrAfter(moment(expireAtMoment)) ||
      moment(now).isAfter(moment(createdAtMoment))
    )
      return next(new Error("Invalid Dates", { cause: 400 }));
    found.createdAt = createdAtMoment;
    found.expireAt = expireAtMoment;
  }
  if (createdAtMoment) {
    const createdAtMoment = moment(new Date(createdAt)).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    const now = moment().format("YYYY-MM-DD HH:mm:ss");
    if (moment(now).isAfter(moment(createdAtMoment)))
      return next(new Error("Invalid Dates", { cause: 400 }));
    if (moment(createdAtMoment).isSameOrAfter(moment(found.expireAt)))
      return next(new Error("Invalid Dates", { cause: 400 }));
    found.createdAt = createdAtMoment;
  }
  if (expireAt) {
    const expireAtMoment = moment(new Date(expireAt)).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    const now = moment().format("YYYY-MM-DD HH:mm:ss");
    if (moment(now).isAfter(moment(expireAtMoment)))
      return next(new Error("Invalid Dates", { cause: 400 }));
    if (moment(expireAtMoment).isSameOrBefore(moment(found.createdAt)))
      return next(new Error("Invalid Dates", { cause: 400 }));
    found.expireAt = expireAtMoment;
  }
  const updated = await found.save();
  if (!updated) return next(new Error("Coupon not updated", { cause: 500 }));
  res.status(200).json({ message: "Coupon updated succesfully", updated });
};
