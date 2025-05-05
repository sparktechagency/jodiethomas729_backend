import mongoose, { Document, Schema, Model } from "mongoose";
import { IEducational, IUser, IWorkExperience } from "./user.interface";

const EducationalSchema = new Schema<IEducational>({
  level_of_education: {
    type: String,
    required: true,
  },
  exam_title: {
    type: String,
    required: true,
  },
  institution: {
    type: String,
    required: true,
  },
  result: {
    type: String,
    required: true,
  },
  result_type: {
    type: String,
    required: true,
  },
  start_year: {
    type: String,
    required: true,
  },
  passing_year: {
    type: String,
    required: true,
  },
})

const WorkExSchema = new Schema<IWorkExperience>({
  job_title: {
    type: String,
    required: true,
  },
  company_name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  from_date: {
    type: String,
    required: true,
  },
  start_date: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
})

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
    nid_no: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      default: null,
    },
    present_address: {
      type: String,
      default: null,
    },
    permanent_address: {
      type: String,
    },
    details: {
      type: String,
    },
    educational_info: {
      type: [EducationalSchema],
    },
    work_experience: {
      type: [WorkExSchema]
    },
    skill: {
      type: [String],
    },
    curricular_activities: {
      type: [String],
      default: 0,
    },
    hobbies: {
      type: [String],
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
  }, {
  timestamps: true,
}
);

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
