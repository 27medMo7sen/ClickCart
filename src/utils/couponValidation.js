import { couponModel } from "../../DB/Models/coupon.model.js";
import moment from "moment-timezone";
export const validateCoupon = async (couponCode, userId) => {
  const coupon = await couponModel.findOne({ couponCode });
  if (!coupon) return { valid: false, message: "Coupon not foundddd" };
  if (
    coupon.couponStatus == "Expired" ||
    moment(new date(coupon.toDate)).isBefore(moment().tz("Africa/Cairo"))
  )
    return { valid: false, message: "Coupon expired" };
  if (
    coupon.couponStatus == "Valid" &&
    moment().isBefore(moment(new date(coupon.fromDate)).tz("Africa/Cairo"))
  )
    return { valid: false, message: "Coupon not valid yet" };
  let flag = false;
  if (!flag) return { valid: false, message: "Coupon not assigned to user" };
  let u;
  let couponAssgined = [];
  for (const user of coupon.couponAssginedToUsers) {
    if (String(user.userId) != String(userId)) {
      couponAssgined.push(user);
    } else {
      u = user;
      u.used += 1;
      flag = true;
      if (user.used >= user.maxUsage) {
        return { valid: false, message: "Coupon usage limit exceeded" };
      }
      couponAssgined.push(u);
    }
  }
  if (!flag) return { valid: false, message: "Coupon not assigned to user" };
  coupon.couponAssginedToUsers = couponAssgined;
  const isPercentage = coupon.isPercentage;
  const amount = coupon.couponAmount;
  await coupon.save();
  return { valid: true, isPercentage, amount, coupon };
};
