import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  authId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  profile_image?: string | null;
  phone_number?: string | null;
  isPhoneNumberVerified: boolean;
  nid_No?: string | null;
  gender?: string | null;
  present_address?: string | null;
  permanent_address?: string;
  details?: string;
  educational_info?: IEducational[];
  work_experience?: IWorkExperience[];
  skill?: string[];
  curricular_activities?: string[];
  hobbies?: string[];
  status: "active" | "deactivate";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEducational {
  level_of_education: string;
  exam_title: string;
  institution: string;
  result: string;
  result_type: string;
  start_year: string;
  passing_year: string;
}

export interface IWorkExperience {
  job_title: string;
  company_name: string;
  location: string;
  from_date: string;
  start_date: string;
  details: string;
}