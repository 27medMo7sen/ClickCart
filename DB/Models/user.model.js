import { hashSync } from "bcrypt";
import { model, Schema } from "mongoose";
const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    isConfirmed: {
      type: Boolean,
      required: true,
      default: false,
    },
    role: {
      type: String,
      default: "User",
      enum: ["User", "Admin", "SuperAdmin"],
    },
    phoneNumber: {
      type: String,
      unique: false,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    address: [
      {
        type: String,
        required: true,
      },
    ],
    profilePic: {
      secure_url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    status: {
      type: String,
      default: "offline",
      enum: ["online", "offline"],
    },
    gender: {
      type: String,
      default: "not specified",
      enum: ["male", "female", "not specified"],
    },
    age: Number,
    token: String,
    forgetCode: String,
  },
  { timestamps: true }
);
userSchema.pre("save", function (next, hash) {
  this.password = hashSync(this.password, +process.env.SALT_ROUNDS);
  next();
});
export const userModel = model("User", userSchema);
