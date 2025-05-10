import { Types } from "mongoose";
import QueryBuilder from "../../../builder/QueryBuilder";
import { IReqUser } from "../auth/auth.interface";
import { IApplications, IJobs } from "./jobs.interface";
import { jobValidationSchema } from "./jobValidation";
import { Applications, Jobs } from "./jobs.model";
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

const getEmployerJobs = async (user: IReqUser, query: any) => {
    const { page, limit } = query;
    const { authId } = user;
    console.log("query", authId)

    const transitionQuery = new QueryBuilder(Jobs.find({ authId })
        , query)
        .search([])
        .filter()
        .sort()
        .paginate()
        .fields()

    const result = await transitionQuery.modelQuery;
    const meta = await transitionQuery.countTotal();
    // console.log(result)
    return { result, meta };

};

const applyJobs = async (
    jobId: string,
    user: IReqUser,
    payload: IApplications,
    files: Express.Multer.File[]
) => {
    const { userId } = user;

    try {
        // @ts-ignore
        if (files && files?.path) {
            // @ts-ignore
            payload.resume = files.path;
        }

        const jobs = await Jobs.findById(jobId)
        if (!jobs) {
            throw new AppError(404, "Job not found.");
        }
        if (jobs.status === "Expired") {
            throw new AppError(400, "This job is already closed.");
        }

        const applyData = {
            ...payload,
            jobId: new Types.ObjectId(jobId),
            userId: new Types.ObjectId(userId),
        };

        const newApplication = new Applications(applyData);
        await newApplication.save();

        await Jobs.findByIdAndUpdate(
            jobId,
            { $push: { applications: newApplication._id } },
            { new: true }
        );

        return newApplication;

    } catch (error: any) {
        throw new AppError(404, error.message);
    }
};

const getJobsApplications = async (user: IReqUser, query: any) => {
    const { page, limit, jobId } = query;
    const { authId } = user;
    console.log("query", authId, page, limit, jobId)

    const transitionQuery = new QueryBuilder(Applications.find({ jobId }).populate({
        path: "userId",
        select: "name email profile_image phone_number details present_address gender skill"
    })
        , query)
        .search([])
        .filter()
        .sort()
        .paginate()
        .fields()

    const result = await transitionQuery.modelQuery;
    const meta = await transitionQuery.countTotal();
    // console.log(result)
    return { result, meta };
};

const getJobsDetails = async (query: any) => {
    const { page, limit, jobId } = query;

    const jobDetails = await Jobs.findById(jobId).select("-applications")

    const transitionQuery = new QueryBuilder(Applications.find({ jobId }).populate({
        path: "userId",
        select: "name email profile_image phone_number details present_address gender skill"
    })
        , query)
        .search([])
        .filter()
        .sort()
        .paginate()
        .fields()

    const result = await transitionQuery.modelQuery;
    const meta = await transitionQuery.countTotal();
    // console.log(result)
    return { jobDetails, result, meta };
};


export const JobsServices = {
    createNewJob,
    updateJobs,
    getEmployerJobs,
    applyJobs,
    getJobsApplications,
    getJobsDetails
}