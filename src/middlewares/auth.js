import { userModel } from "../../DB/Models/user.model.js";
import { generateToken, verifyToken } from "../utils/tokenFunctions.js";

export const isAuth = (roles) => {
  return async (req, res, next) => {
    try {
      const { authorization } = req.headers;
      if (!authorization) {
        return next(new Error("Please login first", { cause: 400 }));
      }

      if (!authorization.startsWith("Ecomm")) {
        return next(new Error("invalid token prefix", { cause: 400 }));
      }

      const splitedToken = authorization.split(" ")[1];
      try {
        const decodedData = verifyToken({
          token: splitedToken,
          signature: process.env.SIGN_IN_TOKEN_SECRET,
        });

        const findUser = await userModel.findById(
          decodedData._id,
          "email userName role token"
        );
        if (!findUser) {
          return next(new Error("Please SignUp", { cause: 400 }));
        }
        if (findUser.token != splitedToken) {
          return next(new Error("Please login first", { cause: 400 }));
        }
       
        req.user = findUser;
        if (roles && !roles.includes(findUser.role)) {
          return next(
            new Error("You are not authorized to access this route", {
              cause: 403,
            })
          );
        }
        next();
      } catch (error) {
        // token  => search in db
        let refreshed = false;

        if (error == "TokenExpiredError: jwt expired") {
          // refresh token

          const user = await userModel.findOne({ token: splitedToken });
          if (!user) {
            return next(new Error("Wrong token", { cause: 400 }));
          }
          // generate new token
          const userToken = generateToken({
            payload: {
              email: user.email,
              _id: user._id,
            },
            signature: process.env.SIGN_IN_TOKEN_SECRET,
            expiresIn: "1h",
          });

          if (!userToken) {
            return next(
              new Error("token generation fail, payload canot be empty", {
                cause: 400,
              })
            );
          }

          const modifiedUser = await userModel.findByIdAndUpdate(user._id, {
            token: userToken,
          });
          await res.cookie("userToken", userToken, {
            maxAge: 1000 * 60 * 60 * 2,
            path: "/",
            sameSite: "Lax",
            secure: true,
          });
          refreshed = true;
          req.user = modifiedUser;
          console.log("refresh tokennnn");
        }
        if (!refreshed) return next(new Error("invalid token", { cause: 428 }));
        next();
      }
    } catch (error) {
      console.log(error);
      next(new Error("catch error in auth", { cause: 500 }));
    }
  };
};
