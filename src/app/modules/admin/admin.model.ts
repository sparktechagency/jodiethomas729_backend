import mongoose, { Document, Model } from "mongoose";
import { IAdmin } from "./admin.interface";

const AdminSchema = new mongoose.Schema<IAdmin>(
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
    phone_number: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    profile_image: {
      type: String,
      default: null,
    },
    company_name: {
      type: String,
      default: null,
    },
    contact: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Statics
const Admin: Model<IAdmin> = mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
