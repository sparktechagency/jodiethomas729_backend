import mongoose, { Model, Schema } from "mongoose";
import { IApplications, IJobAlert, IJobs } from "./jobs.interface";
import { access } from "fs";

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
        experience: {
            type: String,
            required: true,
            enum: ["freshers", "1_2_years", "2_4_years", "4_6_years", "6_8_years", "8_10_years", "10plus"]
        },
        types: {
            type: String,
            required: true,
            enum: ["full_time", "part_time", "internship", "remote_hybrid", "temporary", "fixedterm_contract", "apprenticeship", "graduate_entrylevel"]
        },
        education: {
            type: String,
            required: true,
            enum: ["gcse_or_equivalent", "apprenticeship", "hnc_hnd", "degree", "other"]
        },
        skill: { type: [String] },
        vacancies: { type: Number },
        application_dateline: { type: Date },
        locations: { type: locationSchema },
        descriptions: { type: String, required: true },
        applications: {
            type: [Schema.Types.ObjectId],
            ref: 'Applications',
            default: [],
        },
        favorite: {
            type: [Schema.Types.ObjectId],
            ref: 'Auth',
            default: [],
        },
        status: {
            type: String,
            enum: ["Active", "Expired"],
            default: "Active"
        },
        availabilities: { type: String },
        rate: {
            type: String,
            enum: ["par_hour", "par_day", "par_year"],
        },
        job_pattern: {
            type: String,
            enum: ["day_shift", "evening_shift", "days", "hours", "flexibility"]
        },
        //city
        address: { type: String, required: true },


    },
    { timestamps: true }
);
JobsSchema.index({ locations: "2dsphere" });


const ApplicationsSchema = new Schema<IApplications>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        jobId: { type: Schema.Types.ObjectId, ref: 'Jobs', required: true },
        resume: { type: String, required: true },
        expected_salary: { type: Number },
        cover_letter: { type: String },
    },
    { timestamps: true }
);

const JobAlertSchema = new Schema<IJobAlert>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Jobs', required: true },
    isOpen: { type: Boolean, default: false }
},
    { timestamps: true }
);


const Jobs: Model<IJobs> = mongoose.model<IJobs>('Jobs', JobsSchema);
const Applications: Model<IApplications> = mongoose.model<IApplications>('Applications', ApplicationsSchema);
const JobAlert: Model<IJobAlert> = mongoose.model<IJobAlert>('JobAlert', JobAlertSchema);
export { Jobs, Applications, JobAlert };