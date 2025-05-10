import mongoose, { Model, Schema } from "mongoose";
import { IApplications, IJobs } from "./jobs.interface";

const JobsSchema = new Schema<IJobs>(
    {
        authId: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'Employer', required: true },
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
        applications: {
            type: [Schema.Types.ObjectId],
            ref: 'Applications',
            default: [],
        },
        status: {
            type: String,
            enum: ["Active", "Expired"],
            default: "Active"
        },
        availabilities: { type: String },
    },
    { timestamps: true }
);

const ApplicationsSchema = new Schema<IApplications>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        jobId: { type: Schema.Types.ObjectId, ref: 'Jobs', required: true },
        resume: { type: String, required: true },
        cover_letter: { type: String, required: true },
    },
    { timestamps: true }
);


const Jobs: Model<IJobs> = mongoose.model<IJobs>('Jobs', JobsSchema);
const Applications: Model<IApplications> = mongoose.model<IApplications>('Applications', ApplicationsSchema);
export { Jobs, Applications };