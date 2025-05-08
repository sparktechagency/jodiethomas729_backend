import { Types } from "mongoose";
import QueryBuilder from "../../../builder/QueryBuilder";
import { IReqUser } from "../auth/auth.interface";
import { IJobs } from "./jobs.interface";
import { jobValidationSchema } from "./jobValidation";
import { Jobs } from "./jobs.model";
import AppError from "../../../errors/AppError";


// ======================================
const createNewJob = async (user: IReqUser, payload: IJobs) => {
    const { authId } = user;
    try {
        const parsedData = jobValidationSchema.parse(payload);

        const jobData = {
            ...parsedData,
            authId: new Types.ObjectId(authId),
        };

        console.log('====', jobData)

        const job = new Jobs(jobData);
        await job.save();
        return job;

    } catch (error: any) {
        if (error.name === 'ZodError') {
            throw new AppError(404, 'Job creation failed: ' + error.errors.map((e: any) => e.message).join(', '));
        }
        throw new AppError(404, 'Unexpected error while creating job');
    }
};


const updateJobs = async (jobId: string, payload: Partial<IJobs>) => {

    try {
        if (!Types.ObjectId.isValid(jobId)) {
            throw new Error('Invalid job ID');
        }

        const parsedData = jobValidationSchema.partial().parse(payload);

        const job = await Jobs.findById(jobId);
        if (!job) {
            throw new Error('Job not found or unauthorized');
        }

        Object.assign(job, parsedData);
        await job.save();

        console.log("==============", job)

        return job;

    } catch (error: any) {
        if (error.name === 'ZodError') {
            throw new AppError(404, 'Job creation failed: ' + error.errors.map((e: any) => e.message).join(', '));
        }
        throw new AppError(404, 'Unexpected error while creating job');
    }
};


export const JobsServices = {
    createNewJob,
    updateJobs
}