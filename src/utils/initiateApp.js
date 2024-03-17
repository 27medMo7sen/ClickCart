import { connectionDB } from "../../DB/connection.js";
import * as allRouter from "../modules/index.routes.js";
import { globalResponse } from "./errorhandling.js";
export const initiateApp = (app, express) => {
  app.use(express.json());
  connectionDB();
  app.use("/category", allRouter.categoryRouter);
  app.use("/subCategory", allRouter.subcategorRouter);
  app.use("/brand", allRouter.brandRouter);
  const port = process.env.PORT;

  app.all("*", (req, res, next) =>
    res.status(404).json({ message: "404 Not Found URL" })
  );

  app.use(globalResponse);

  app.get("/", (req, res) => res.send("Hello World!"));
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
};
