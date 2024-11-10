import { connectionDB } from "../../DB/connection.js";
import * as allRouter from "../modules/index.routes.js";
import { chagngeCouponStatus } from "./Crons.js";
import { globalResponse } from "./errorhandling.js";
import cors from "cors";
export const initiateApp = (app, express) => {
  app.use(cors({ origin: "http://localhost:3000", credentials: true }));
  app.use(express.json());
  connectionDB();
  app.get("/", (req, res) => res.send("Hello World!"));
  app.use("/category", allRouter.categoryRouter);
  app.use("/subCategory", allRouter.subcategorRouter);
  app.use("/brand", allRouter.brandRouter);
  app.use("/product", allRouter.productRouter);
  app.use("/coupon", allRouter.couponRouter);
  app.use("/auth", allRouter.authRouter);
  app.use("/cart", allRouter.cartRouter);
  app.use("/order", allRouter.orderRouter);
  app.use("/review", allRouter.reviewRouter);
  const port = process.env.PORT;

  app.all("*", (req, res, next) =>
    res.status(404).json({ message: "404 Not Found URL" })
  );

  app.use(globalResponse);
  // chagngeCouponStatus();
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
};
