import { sendEmailService } from "./../../services/sendEmailService.js";
import { generateToken, verifyToken } from "./../../utils/tokenFunctions.js";
import { userModel } from "./../../../DB/Models/user.model.js";
import { emailTemplate } from "../../utils/emailTemplate.js";
import Cloudinary from "../../utils/coludinaryConfigrations.js";
import pkg from "bcrypt";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("123456_=!ascbhdtel", 5);
//=================== SignUp ===================
//MARK: sign up
export const signUp = async (req, res, next) => {
  const { userName, email, password, age, gender, phoneNumber, address } =
    req.body;

  const userNameExist = await userModel.findOne({ userName });

  if (userNameExist) {
    return next(new Error("User name already exist", { cause: 436 }));
  }
  const emailExist = await userModel.findOne({ email });
  if (emailExist) return next(new Error("Email already exist", { cause: 436 }));

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
  if (!newUser) return next(new Error("User not created", { cause: 500 }));
  const token = generateToken({
    payload: { email },
    signature: process.env.CONFIRMATION_EMAIL_TOKEN,
    expiresIn: "1h",
  });
  const confirmationLink = `${req.protocol}://localhost:3000/confirm/${token}`;
  const isEmailsent = sendEmailService({
    to: email,
    subject: "Confirm Email",
    message: emailTemplate({
      link: confirmationLink,
      linkData:
        "Please click the button below to confirm your email and finish setting up your account. This link will expire in 1 hour.",
      subject: "Email Confirmation",
      buttonText: "Confirm",
    }),
  });
  if (!isEmailsent) return next(new Error("Email not sent", { cause: 500 }));
  res.status(201).json({ message: "User created successfully", newUser });
};
//MARK: confirm E-mail
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

  if (!user)
    return next(new Error("You E-mail already confirmed", { cause: 400 }));
  else res.status(200).json({ message: "Email confirmed successfully", user });
};
// MARK: login
export const logIn = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email: email, isConfirmed: true });
  if (!user) return next(new Error("Email not found", { cause: 436 }));
  if (!pkg.compareSync(password, user.password))
    return next(new Error("Password not correct", { cause: 436 }));
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
  await res.cookie("userToken", token, {
    maxAge: 1000 * 60 * 60 * 2,
    path: "/",
    sameSite: "Lax",
    secure: true,
  });
  res.status(200).json({ message: "User logged in", updatedUser });
};
//MARK: forgot password
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) return next(new Error("Email not found", { cause: 436 }));
  const code = nanoid();
  await userModel.findOneAndUpdate({ email }, { forgetCode: code });
  const token = generateToken({
    payload: { email, code },
    signature: process.env.FORGET_PASSWORD_TOKEN,
    expiresIn: "1h",
  });

  const confirmationLink = `${req.protocol}://://localhost:3000/login/new-password/${token}`;
  const isEmailSent = sendEmailService({
    to: email,
    subject: "Forget Password",
    message: emailTemplate({
      link: confirmationLink,
      linkData:
        "Please click the button below to update your passwor. This link will expire in 1 hour.",
      subject: "Forget Password",
      buttonText: "Update",
    }),
  });

  if (!isEmailSent) return next(new Error("Email not sent", { cause: 500 }));

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
    return next(
      new Error("you've already reseted your password, try to login", {
        cause: 404,
      })
    );
  user.password = newPassword;
  user.forgetCode = null;
  const updatedUser = await user.save();
  if (!updatedUser)
    return next(new Error("Password not updated", { cause: 500 }));
  res.status(200).json({ message: "Password updated successfully" });
};
// MARK: log out
export const logOut = async (req, res, next) => {
  const { _id } = req.user;
  const user = await userModel.findOneAndUpdate(
    { _id },
    { status: "offline", token: "" },
    { new: true }
  );
  if (!user) return next(new Error("User not found", { cause: 404 }));
  res.status(200).json({ message: "User logged out successfully" });
};
//MARK: profile
export const profile = async (req, res, next) => {
  const { _id } = req.user;
  const user = await userModel.findById(_id);
  if (!user) return next(new Error("User not found", { cause: 404 }));
  res.status(200).json(user);
};
//MARK: add profile picture
export const addProfilePic = async (req, res, next) => {
  const { _id } = req.user;
  await Cloudinary.api.delete_resources_by_prefix(
    `${process.env.PROJECT_FOLDER}/user/${_id}`
  );
  if (!req.file) return next(new Error("Please upload a file", { cause: 400 }));
  const { secure_url, public_id } = await Cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.PROJECT_FOLDER}/user/${_id}`,
      resource_type: "image",
    }
  );
  const user = await userModel.findByIdAndUpdate(
    _id,
    {
      profilePic: { secure_url, public_id },
    },
    { new: true }
  );
  if (!user) return next(new Error("User not found", { cause: 404 }));
  res
    .status(200)
    .json({ message: "Profile pic added successfully", secure_url });
};
//MARK: edit profile
export const editProfile = async (req, res, next) => {
  const { _id } = req.user;
  const { userName, phoneNumber, age } = req.body;
  const isUserNameExist = await userModel.findOne({
    userName,
    _id: { $ne: _id },
  });
  if (isUserNameExist)
    return next(new Error("User name already exist", { cause: 436 }));

  const user = await userModel.findByIdAndUpdate(
    _id,
    {
      userName,
      phoneNumber,
      age,
    },
    { new: true }
  );
  if (!user) return next(new Error("User not found", { cause: 404 }));
  res.status(200).json({ message: "User updated successfully", user });
};
