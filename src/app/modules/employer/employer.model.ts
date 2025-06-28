import mongoose, { Document, Schema, Model } from "mongoose";
import { ICompany, IEmployer, ISocialMedia } from "./employer.interface";

const SocialMediaSchema = new Schema<ISocialMedia>({
  website: { type: String },
  linkedin: { type: String },
  instagram: { type: String },
  facebook: { type: String },
});

const CompanySchema = new Schema<ICompany>({
  company_logo: { type: String, required: true },
  name: { type: String, required: true },
  employer_position: { type: String, required: true },
  locations: { type: String, required: true },
  details: { type: String, required: true },
  website_link: { type: String, default: null },
});

const locationSchema = new Schema({
  type: {
    type: String,
    enum: ["Point"],
    default: "Point",
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const EmployerSchema = new Schema<IEmployer>({
  authId: { type: Schema.Types.ObjectId, required: true, ref: "Auth" },
  name: { type: String, required: true },
  email: { type: String, required: true },
  profile_image: { type: String, default: null },
  phone_number: { type: String, default: null },
  years_of_establishment: { type: Date, default: null },
  company: { type: CompanySchema },
  socialMedia: { type: SocialMediaSchema },
  details: {
    type: String,
    default: null
  },
  address: {
    type: String,
    default: null
  },
  locations: {
    type: locationSchema,
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
}, {
  timestamps: true,
}
);

const Employer: Model<IEmployer> = mongoose.model<IEmployer>("Employer", EmployerSchema);

export default Employer;
