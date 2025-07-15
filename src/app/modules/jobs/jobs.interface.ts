import { Schema, Types } from "mongoose";

export interface IJobs extends Document {
    _id: Schema.Types.ObjectId;
    authId: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
    title: string;
    types: string;
    category: Schema.Types.ObjectId;
    salary: number;
    education: string;
    experience: string;
    skill: string[];
    vacancies: number;
    application_dateline: Date;
    locations: any
    descriptions: string;
    availabilities: string;
    status: string;
    applications: Schema.Types.ObjectId[];
    favorite: Schema.Types.ObjectId[];
    rate: string;
    job_pattern: string;
    address: string;
    postalCode: string;
}


export interface IApplications extends Document {
    userId: Schema.Types.ObjectId;
    jobId: Schema.Types.ObjectId;
    resume: string;
    cover_letter: string;
    expected_salary: number;
}

export interface IJobAlert extends Document {
    userId: Schema.Types.ObjectId;
    jobId: Schema.Types.ObjectId;
    isOpen: boolean;
}

