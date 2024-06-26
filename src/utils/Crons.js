import { scheduleJob } from "node-schedule";
import moment from "moment-timezone";
import { couponModel } from "../../DB/Models/coupon.model.js";
export const chagngeCouponStatus = () => {
  scheduleJob("* * * * * *", async () => {
    const coupons = await couponModel.find({ couponStatus: "Valid" });
    for (let coupon of coupons) {
      if (moment(coupon.toDate).isBefore(moment().tz("Africa/Cairo"))) {
        await couponModel.findByIdAndUpdate(coupon._id, {
          couponStatus: "Expired",
        });
      }
      //   console.log(coupons);
    }
  });
};
