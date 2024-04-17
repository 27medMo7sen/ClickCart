import { scheduleJob } from "node-schedule";
import moment from "moment";
import { couponModel } from "../../DB/Models/coupon.model.js";
export const chagngeCouponStatus = () => {
  scheduleJob("* * * * * *", async () => {
    const coupons = await couponModel.find({ couponStatus: "Valid" });
    for (let coupon of coupons) {
      if (moment(coupon.toDate).isBefore(moment())) {
        await couponModel.findByIdAndUpdate(coupon._id, {
          couponStatus: "Expired",
        });
      }
      //   console.log(coupons);
    }
  });
};
