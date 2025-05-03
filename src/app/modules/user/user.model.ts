import mongoose, { Document, Schema, Model } from "mongoose";
import { IUser } from "./user.interface";
import { ENUM_MEAL_TYPE } from "../../../enums/user";

const UserSchema = new Schema<IUser>(
  {
    authId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Auth",
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    profile_image: {
      type: String,
      default: null,
    },
    phone_number: {
      type: String,
      default: null,
    },
    isPhoneNumberVerified: {
      type: Boolean,
      default: false,
    },
    street: {
      type: String,
      default: null,
    },
    neighborhood: {
      type: String,
      default: null,
    },
    age: {
      type: String,
      default: null,
    },
    weight: {
      type: String,
    },
    hight: {
      type: String,
    },
    activety_lavel: {
      type: String,
    },
    date_of_birth: {
      type: Date,
    },
    amount: {
      type: Number,
      default: 0,
    },
    duration_time: {
      type: Date,
    },
    subscription_status: {
      type: String,
      enum: ["Active", "None", "Expired"],
      default: "None",
    },
    status: {
      type: String,
      enum: ["active", "deactivate"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
