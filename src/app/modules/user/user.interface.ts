import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  authId: mongoose.Types.ObjectId;
  name: string;
  job_title: string[];
  job_seeking: string[];
  email: string;
  profile_image?: string | null;
  phone_number?: string | null;
  isPhoneNumberVerified: boolean;
  nid_no?: string | null;
  gender?: string | null;
  present_address?: string | null;
  permanent_address?: string;
  details?: string;
  educational_info?: IEducational[];
  work_experience?: IWorkExperience[];
  alert_job_type: mongoose.Types.ObjectId[];
  skill?: string[];
  curricular_activities?: string[];
  hobbies?: string[];
  status: "active" | "deactivate";
  createdAt?: Date;
  updatedAt?: Date;
  duration_time: Date;
  subscription_status: string;
  category: mongoose.Types.ObjectId;
  experience: string;
  availability: string[];
  education: string;
  availabil_date: Date,
  profile_private: boolean;
  address: string;
  profile_access: {
    eId: mongoose.Types.ObjectId;
    access: boolean;
  }[];
  favorite: mongoose.Types.ObjectId[];
  locations: any;
  resume: string | undefined;
  plan_id: mongoose.Types.ObjectId;
  careerObjective: string;
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
  end_date: Date;
  start_date: Date;
  details: string;
  currently_work: boolean
}