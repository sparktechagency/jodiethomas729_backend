import mongoose, { Model, Schema } from "mongoose";
import { IJobs } from "./jobs.interface";

const JobsSchema = new Schema<IJobs>(
    {
        authId: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
        title: { type: String, required: true },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        salary: { type: Number },
        education: {
            type: String,
            required: true,
            enum: ["freshers", "1_2_years", "2_4_years", "4_6_years", "6_8_years", "8_10_years", "10_12_years", "12_14_years", "15_years"]
        },
        types: {
            type: String,
            required: true,
            enum: ["full_time", "part_time", "internship", "remote", "temporary", "contract_base"]
        },
        experience: {
            type: String,
            required: true,
            enum: ["high_school", "intermediate", "bachelor_degree", "graduation", "master_degree"]
        },
        skill: { type: [String] },
        vacancies: { type: Number },
        application_dateline: { type: Date },
        locations: { type: String },
        descriptions: { type: String, required: true },
        availabilities: { type: String },
        status: { type: String, enum: ["Active", "Expired"], default: "Active" },
    },
    { timestamps: true }
);


const Jobs: Model<IJobs> = mongoose.model<IJobs>('Jobs', JobsSchema);

export { Jobs };