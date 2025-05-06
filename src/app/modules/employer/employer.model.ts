import mongoose, { Document, Schema, Model } from "mongoose";
import { ICompany, IEmployer, ISocialMedia } from "./employer.interface";

const SocialMediaSchema = new Schema<ISocialMedia>({
  website: { type: String },
  linkedin: { type: String },
  instagram: { type: String },
  facebook: { type: String },
});

const CompanySchema = new Schema<ICompany>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  verifications_no: { type: String, required: true },
  locations: { type: String, required: true },
  service: { type: String, required: true },
  details: { type: String, required: true },
  website_link: { type: String, default: null },
});

const EmployerSchema = new Schema<IEmployer>({
  authId: { type: Schema.Types.ObjectId, required: true, ref: "Auth" },
  name: { type: String, required: true },
  email: { type: String, required: true },
  profile_image: { type: String, default: null },
  banner_image: { type: String, default: null },
  phone_number: { type: String, default: null },
  organization_types: { type: String, default: null },
  industry_types: { type: String, default: null },
  team_size: { type: String, default: null },
  years_of_establishment: { type: Date, default: null },
  isPhoneNumberVerified: { type: Boolean, default: false },
  company: { type: CompanySchema },
  socialMedia: { type: SocialMediaSchema },
  subscription_status: {
    type: String,
    enum: ["Active", "None", "Expired"],
    default: "None",
  },
  duration_time: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["active", "deactivate"],
    default: "active",
  },
}, {
  timestamps: true,
}
);

const Employer: Model<IEmployer> = mongoose.model<IEmployer>("Employer", EmployerSchema);

export default Employer;
