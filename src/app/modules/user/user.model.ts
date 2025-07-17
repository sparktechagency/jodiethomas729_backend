import mongoose, { Document, Schema, Model, Types } from "mongoose";
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
  },
  end_date: {
    type: Date,
  },
  start_date: {
    type: Date,
    required: true,
  },
  currently_work: {
    type: Boolean,
    default: false
  },
  details: {
    type: String,
    required: true,
  },
})

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
    profile_image: {
      type: String,
      default: null,
    },
    careerObjective: {
      type: String,
      default: null,
    },
    job_title: {
      type: [String],
      default: [],
    },
    job_seeking: {
      type: [String],
    },
    email: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      enum: ["freshers", "1_2_years", "2_4_years", "4_6_years", "6_8_years", "8_10_years", "10plus"]
    },
    availability: {
      type: [String],
      enum: ["full_time", "part_time", "internship", "remote_hybrid", "temporary", "fixedterm_contract", "apprenticeship", "graduate_entrylevel"]
    },
    availabil_date: {
      type: Date,
    },
    education: {
      type: String,
      enum: ["gcse_or_equivalent", "apprenticeship", "hnc_hnd", "degree", "other"]
    },
    phone_number: {
      type: String,
      default: null,
    },
    details: {
      type: String,
    },
    address: {
      type: String,
      default: null,
    },
    locations: {
      type: locationSchema,
    },
    // educational_info: {
    //   type: [EducationalSchema],
    // },
    work_experience: {
      type: [WorkExSchema],
      default: [],
    },
    skill: {
      type: [String],
    },
    // curricular_activities: {
    //   type: [String],
    //   default: 0,
    // },
    // hobbies: {
    //   type: [String],
    // },
    alert_job_type: {
      type: [Schema.Types.ObjectId],
      ref: "Category"
    },
    favorite: {
      type: [Schema.Types.ObjectId],
      ref: 'Auth',
      default: [],
    },
    resume: {
      type: String,
      default: undefined,
    },
    profile_private: {
      type: Boolean,
      default: false
    },
    profile_access: {
      type: [{
        eId: {
          type: Schema.Types.ObjectId,
          ref: 'Auth'
        },
        access: {
          type: Boolean
        }
      }],
      default: []
    },
    status: {
      type: String,
      enum: ["active", "deactivate"],
      default: "active",
    },
  }, {
  timestamps: true,
});
UserSchema.index({ locations: "2dsphere" });
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
