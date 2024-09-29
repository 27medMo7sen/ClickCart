import { assign } from "nodemailer/lib/shared/index.js";
import { couponModel } from "../../../DB/Models/coupon.model.js";
import { userModel } from "../../../DB/Models/user.model.js";
//MARK: add coupon
export const addCoupon = async (req, res, next) => {
  const { _id } = req.user;
  const {
    couponCode,
    couponAmount,
    fromDate,
    toDate,
    isPercentage,
    isFixedAmount,
    couponAssginedToUsers,
  } = req.body;

  // check coupon code if it's duplicate
  const isCouponCodeDuplicate = await couponModel.findOne({ couponCode });
  if (isCouponCodeDuplicate) {
    return next(new Error("duplicate couponCode", { cause: 400 }));
  }
  if ((!isFixedAmount && !isPercentage) || (isFixedAmount && isPercentage)) {
    return next(
      new Error("select if the coupon is percentage or fixedAmount", {
        cause: 400,
      })
    );
  }
  let userIds = [];
  for (const user of couponAssginedToUsers) {
    userIds.push(user.userId);
  }
  const exsitUsers = await userModel.find({ _id: { $in: userIds } });
  let notExsitUsers = [];
  for (const user of couponAssginedToUsers) {
    let flag = false;
    for (const i of exsitUsers) {
      if (user.userId == i._id) {
        flag = true;
      }
    }
    if (flag == false) {
      notExsitUsers.push(user.userId);
    }
  }
  if (notExsitUsers.length > 0) {
    return next(
      new Error(`users not found : ${notExsitUsers} `, { cause: 400 })
    );
  }

  const couponObject = {
    couponCode,
    couponAmount,
    fromDate,
    toDate,
    isPercentage,
    isFixedAmount,
    couponAssginedToUsers: couponAssginedToUsers,
    createdBy: _id,
  };
  const couponDb = await couponModel.create(couponObject);
  if (!couponDb) {
    return next(new Error("fail to add coupon", { cause: 400 }));
  }
  res.status(201).json({ message: "Done", couponDb, notExsitUsers });
};
//MARK: update coupon
export const updateCoupon = async (req, res, next) => {
  const { _id } = req.user;
  const { couponId } = req.query;
  const { couponAmount, fromDate, toDate, isPercentage, isFixedAmount } =
    req.body;
  const coupon = await couponModel.findById(couponId);
  if (!coupon) return next(new Error("Coupon not found", { cause: 404 }));
  if (coupon.createdBy != _id && req.user.role != "SuperAdmin")
    return next(
      new Error("You are not authorized to update this coupon", { cause: 401 })
    );
  if (isFixedAmount && isPercentage) {
    return next(
      new Error("select if the coupon is percentage or fixedAmount", {
        cause: 400,
      })
    );
  }
  if (couponAmount) coupon.couponAmount = couponAmount;
  if (fromDate) coupon.fromDate = fromDate;
  if (toDate) coupon.toDate = toDate;
  if (isPercentage) coupon.isPercentage = isPercentage;
  if (isFixedAmount) coupon.isFixedAmount = isFixedAmount;
  coupon.updatedBy = _id;
  const updatedCoupon = await coupon.save();
  res
    .status(200)
    .json({ message: "Coupon updated successfully", updatedCoupon });
};
//MARK: delete coupon
export const deleteCoupon = async (req, res, next) => {
  const { _id } = req.user;
  const { couponId } = req.query;
  const coupon = await couponModel.findById(couponId);
  if (!coupon) return next(new Error("Coupon not found", { cause: 404 }));
  if (coupon.createdBy != _id && req.user.role != "SuperAdmin")
    return next(
      new Error("You are not authorized to update this coupon", { cause: 401 })
    );
  await couponModel.findByIdAndDelete(couponId);
  res.status(200).json({ message: "Coupon deleted successfully" });
};
