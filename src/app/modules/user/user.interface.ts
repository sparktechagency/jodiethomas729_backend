import mongoose, { Document } from "mongoose";

export type IUser = Document & {
  authId: mongoose.Schema.Types.ObjectId;
  name: string;
  email: string;
  profile_image?: string | null;
  phone_number?: string | null;
  isPhoneNumberVerified: boolean;
  street?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  date_of_birth?: Date;
  amount: number;
  status: "active" | "deactivate";
  createdAt?: Date;
  updatedAt?: Date;
  mail_types: string[];
  relevant_dielary: string[];
  age: string;
  weight: string;
  hight: string;
  activety_lavel: string;
  duration_time: Date;
  subscription_status: string;
}