import { sendEmailService } from "./../../services/sendEmailService.js";
import { generateToken, verifyToken } from "./../../utils/tokenFunctions.js";
import { userModel } from "./../../../DB/Models/user.model.js";
import { emailTemplate } from "../../utils/emailTemplate.js";
import pkg from "bcrypt";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("123456_=!ascbhdtel", 5);
//=================== SignUp ===================
//MARK: sign up
export const signUp = async (req, res, next) => {
  const { userName, email, password, age, gender, phoneNumber, address } =
    req.body;
  const emailExist = await userModel.findOne({ email });
  if (emailExist) next(new Error("Email already exist", { cause: 400 }));
  const phoneExist = await userModel.findOne({ phoneNumber });
  console.log(phoneNumber);
  if (phoneExist) next(new Error("Phone number already exist", { cause: 400 }));
  const token = generateToken({
    payload: { email },
    signature: process.env.CONFIRMATION_EMAIL_TOKEN,
    expiresIn: "1h",
  });
  const confirmationLink = `${req.protocol}://${req.headers.host}/auth/confirm/${token}`;
  const isEmailsent = sendEmailService({
    to: email,
    subject: "Confirm Email",
    message: emailTemplate({
      link: confirmationLink,
      linkData: "click here to confirm your email",
      subject: "Email Confirmation",
    }),
  });
  if (!isEmailsent) next(new Error("Email not sent", { cause: 500 }));
  const user = new userModel({
    userName,
    email,
    password,
    age,
    gender,
    phoneNumber,
    address,
  });
  const newUser = await user.save();
  if (!newUser) next(new Error("User not created", { cause: 500 }));
  res.status(201).json({ message: "User created successfully", newUser });
};
export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;
  const decode = verifyToken({
    token,
    signature: process.env.CONFIRMATION_EMAIL_TOKEN,
  });
  const user = await userModel.findOneAndUpdate(
    { email: decode.email, isConfirmed: false },
    { isConfirmed: true },
    { new: true }
  );
  if (!user) next(new Error("already confirmed", { cause: 404 }));
  else res.status(200).json({ message: "Email confirmed successfully" });
};
// MARK: login
export const logIn = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email: email });
  if (!user) next(new Error("Email not found", { cause: 404 }));
  if (!pkg.compareSync(password, user.password))
    next(new Error("Password not correct", { cause: 400 }));
  const token = generateToken({
    payload: {
      email,
      _id: user._id,
      role: user.role,
    },
    signature: process.env.SIGN_IN_TOKEN_SECRET,
    expiresIn: "1h",
  });

  const updatedUser = await userModel.findOneAndUpdate(
    { email },
    { token, status: "online" },
    { new: true }
  );

  res.status(200).json({ message: "User logged in", updatedUser });
};
//MARK: forgot password
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) next(new Error("Email not found", { cause: 404 }));
  const code = nanoid();
  await userModel.findOneAndUpdate({ email }, { forgetCode: code });
  const token = generateToken({
    payload: { email, code },
    signature: process.env.FORGET_PASSWORD_TOKEN,
    expiresIn: "1h",
  });
  const confirmationLink = `${req.protocol}://${req.headers.host}/auth/resetPassword/${token}`;
  const isEmailSent = sendEmailService({
    to: email,
    subject: "Forget Password",
    message: emailTemplate({
      link: confirmationLink,
      linkData: "click here to reset your password",
      subject: "Forget Password",
    }),
  });
  if (!isEmailSent) next(new Error("Email not sent", { cause: 500 }));
  res.status(200).json({ message: "Email sent successfully", token });
};
//MARK: reset password
export const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  const decode = verifyToken({
    token,
    signature: process.env.FORGET_PASSWORD_TOKEN,
  });
  const user = await userModel.findOne({
    email: decode.email,
    forgetCode: decode.code,
  });
  if (!user)
    next(
      new Error("you've already reseted your password, try to login", {
        cause: 404,
      })
    );
  user.password = newPassword;
  user.forgetCode = null;
  const updatedUser = await user.save();
  if (!updatedUser) next(new Error("Password not updated", { cause: 500 }));
  res.status(200).json({ message: "Password updated successfully" });
};
