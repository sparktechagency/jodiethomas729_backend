import mongoose, { Document } from "mongoose";

export type ICompany = Document & {
  name: string;
  email: string;
  phone: string;
  verifications_no: string
  locations: string;
  service: string;
  details: string;
  employer_position: string
  website_link: string;
  company_logo: string
}

export type ISocialMedia = Document & {
  website: string;
  linkedin: string;
  instagram: string;
  facebook: string;
}

export type IEmployer = Document & {
  authId: mongoose.Schema.Types.ObjectId;
  name: string;
  email: string;
  banner_image: string;
  profile_image?: string | null;
  phone_number?: string | null;
  isPhoneNumberVerified: boolean;
  company: ICompany;
  socialMedia: ISocialMedia;
  subscription_status: string;
  status: "active" | "deactivate";
  createdAt?: Date;
  updatedAt?: Date;
  duration_time: Date;
  organization_types: string;
  industry_types: string;
  team_size: string;
  years_of_establishment: Date;
}
