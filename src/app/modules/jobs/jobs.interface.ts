import { Schema, Types } from "mongoose";

export interface IJobs extends Document {
    authId: Schema.Types.ObjectId;
    title: string;
    types: string;
    category: Schema.Types.ObjectId;
    salary: number;
    education: string;
    experience: string;
    skill: string[];
    vacancies: number;
    application_dateline: Date;
    locations: string
    descriptions: string;
    availabilities: string;
    status: string;
}


export interface IApplications extends Document {
    authId: Schema.Types.ObjectId;
    jobId: Schema.Types.ObjectId;
    resume: string;
    cover_letter: string;
}
