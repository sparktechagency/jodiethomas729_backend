import mongoose, { Schema, Types } from "mongoose";
import QueryBuilder from "../../../builder/QueryBuilder";
import { IReqUser } from "../auth/auth.interface";
import { IApplications, IJobs } from "./jobs.interface";
import { jobValidationSchema } from "./jobValidation";
import { Applications, JobAlert, Jobs } from "./jobs.model";
import AppError from "../../../errors/AppError";
import ApiError from "../../../errors/ApiError";
import User from "../user/user.model";
import { Category } from "../dashboard/dashboard.model";

// ======================================
const createNewJob = async (user: IReqUser, payload: IJobs) => {
    const { authId, userId } = user;
    try {
        const parsedData = jobValidationSchema.parse(payload);

        const jobData = {
            ...parsedData,
            authId: new Types.ObjectId(authId),
            userId: new Types.ObjectId(userId),
        };

        const job = new Jobs(jobData);
        await job.save();

        // 🔔 Trigger job alert logic
        await sendJobAlerts(job);

        return job;

    } catch (error: any) {
        if (error.name === 'ZodError') {
            throw new AppError(404, 'Job creation failed: ' + error.errors.map((e: any) => e.message).join(', '));
        }
        throw new AppError(404, 'Unexpected error while creating job');
    }
};

const sendJobAlerts = async (job: any) => {
    try {
        const matchingUsers = await User.find({
            alert_job_type: { $in: [job.category] },
            status: 'active',
        });

        // const skillMatchedUsers = matchingUsers.filter(user => {
        //     return user.skill?.some(skill => job.skill?.includes(skill));
        // });

        const alerts = matchingUsers.map(user => ({
            userId: user._id,
            jobId: job?._id,
        }));

        if (alerts.length > 0) {
            await JobAlert.insertMany(alerts);
        }

    } catch (err) {
        console.error("Failed to send job alerts:", err);
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
        // select: "name email profile_image phone_number details present_address gender skill"
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

    const jobDetails = await Jobs.findById(jobId).select("-applications -favorite")

    const transitionQuery = new QueryBuilder(Applications.find({ jobId }).populate({
        path: "userId",
        // select: "name email profile_image phone_number details present_address gender skill"
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

const makeExpireJobs = async (
    jobId: string,
    payload: any
) => {
    try {
        const job = await Jobs.findById(jobId);

        if (!job) {
            throw new AppError(404, "Job not found.");
        }

        console.log("payload", payload)

        const result = await Jobs.findByIdAndUpdate(jobId, payload, { new: true });

        return result;

    } catch (error: any) {
        throw new AppError(500, error.message);
    }
};

const getAllApplyCandidate = async (user: IReqUser, query: any) => {
    const { page, limit, jobId } = query;
    const { userId } = user;

    const transitionQuery = new QueryBuilder(
        Applications.find({ userId }).populate({
            path: "jobId",
            populate: {
                path: "userId",
                select: "profile_image organization_types years_of_establishment company socialMedia"
            }
        }),
        query
    )
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

const addRemoveFavorites = async (authId: Schema.Types.ObjectId, jobId: Types.ObjectId) => {
    const jobs = await Jobs.findById(jobId);
    if (!jobs) {
        throw new ApiError(404, "Job not found");
    }
    const isFavorites = jobs.favorite.includes(authId);

    if (isFavorites) {
        jobs.favorite = jobs.favorite.filter(id => id.toString() !== authId.toString());
    } else {
        jobs.favorite.push(authId);
    }
    await jobs.save();

    return { message: isFavorites ? "Removed from favorites" : "Added to favorites" };
};

const getUserFavorites = async (user: IReqUser) => {
    const authId = user.authId;

    const jobs = await Jobs.find({ favorite: { $in: [authId] } })
        .populate({
            path: "userId",
            select: "profile_image organization_types years_of_establishment company socialMedia"
        })
        .select("-favorite -applications")
        .lean();

    const updatedJobs = jobs.map(job => ({
        ...job,
        isFavorite: true
    }));

    return { jobs: updatedJobs };
};

const getCandidateOverview = async (user: IReqUser) => {
    const { authId, userId } = user;

    const favoriteJobCount = await Jobs.countDocuments({ favorite: { $in: [authId] } });
    const applicationCount = await Applications.countDocuments({ userId });
    const jobAlertCount = await JobAlert.countDocuments({ userId });
    const recentlyApplied = await Applications.find({ userId })
        .populate({
            path: "jobId",
            populate: {
                path: "userId",
                select: "profile_image organization_types years_of_establishment company socialMedia"
            }
        }).sort({ createdAt: -1 }).limit(7);
    const newAlertCount = await JobAlert.countDocuments({ userId, isOpen: false });

    return {
        favoriteJobCount,
        applicationCount,
        jobAlertCount,
        newAlertCount,
        recentlyApplied,
    };
};

const getCandidateJobAlert = async (user: IReqUser, query: any) => {
    const { page, limit } = query;
    const { userId } = user;

    const transitionQuery = new QueryBuilder(
        JobAlert.find({ userId }).populate({
            path: "jobId",
            populate: {
                path: "userId",
                select: "profile_image organization_types years_of_establishment company socialMedia"
            }
        }),
        query
    )
        .search([])
        .filter()
        .sort()
        .paginate()
        .fields()

    const result = await transitionQuery.modelQuery;
    const meta = await transitionQuery.countTotal();
    // updates status;
    await JobAlert.updateMany(
        { isOpen: false },
        { $set: { isOpen: true } }
    );

    return { result, meta };
};

const allCategoryWithJobs = async () => {

    const jobCounts = await Jobs.aggregate([
        {
            $group: {
                _id: "$category",
                jobCount: { $sum: 1 }
            }
        }
    ]);

    const countMap = new Map(jobCounts.map(item => [item._id.toString(), item.jobCount]));

    const categories = await Category.find();

    const categoryWithCounts = categories.map(cat => ({
        ...cat.toObject(),
        jobCount: countMap.get(cat._id.toString()) || 0
    }));

    categoryWithCounts.sort((a, b) => b.jobCount - a.jobCount);

    return {
        categories: categoryWithCounts
    };
};

const getRecentJobs = async (query: any) => {
    const { authId } = query;

    console.log("authId", authId)
    if (authId) {
        delete query.authId
    }

    const transitionQuery = new QueryBuilder(
        // @ts-ignore
        Jobs.find().select("title category locations types experience education createdAt userId favorite").lean(),
        query
    )
        .search([])
        .filter()
        .sort()
        .paginate()
        .fields();

    let result: any = await transitionQuery.modelQuery;
    const meta = await transitionQuery.countTotal();
    if (result?.length && authId) {
        result = result.map((job: any) => {
            const isFavorite = Array.isArray(job.favorite) && job.favorite.some((id: any) => id.toString() === authId);
            const { favorite, ...jobWithoutFavorite } = job;
            return {
                ...jobWithoutFavorite,
                isFavorite,
            };
        });
    } else {
        result = result?.map((job: any) => {
            const isFavorite = false
            const { favorite, ...jobWithoutFavorite } = job;
            return {
                ...jobWithoutFavorite,
                isFavorite,
            };
        });
    }


    return { result, meta };
};

const getSearchFilterJobs = async (query: any) => {
    let {
        experience,
        types,
        education,
        category,
        title,
        locations,
        authId,
        page = 1,
        limit = 10,
    } = query;

    const filter: any = {
        status: "Active",
    };

    const parseArray = (value: any) => {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            return Array.isArray(value) ? value : [value];
        }
    };

    if (experience) filter.experience = { $in: parseArray(experience) };
    if (types) filter.types = { $in: parseArray(types) };
    if (education) filter.education = { $in: parseArray(education) };
    if (category) filter.category = { $in: parseArray(category) };

    if (title || locations) {
        filter.$or = [];
        if (title) {
            filter.$or.push({
                title: { $regex: title, $options: "i" },
            });
        }
        if (locations) {
            filter.$or.push({
                locations: { $regex: locations, $options: "i" },
            });
        }
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let [jobs, total] = await Promise.all([
        Jobs.find(filter)
            .select("title category locations types experience education createdAt userId favorite")
            .populate('category')
            .populate({
                path: "userId",
                select: "profile_image organization_types years_of_establishment company"
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),

        Jobs.countDocuments(filter)
    ]);

    if (jobs?.length && authId) {
        // @ts-ignore
        jobs = jobs?.map((job: any) => {
            const isFavorite = Array.isArray(job.favorite) && job.favorite.some((id: any) => id.toString() === authId.toString());
            const { favorite, ...jobWithoutFavorite } = job;
            return {
                ...jobWithoutFavorite,
                isFavorite,
            };
        });
    } else {
        jobs = jobs?.map((job: any) => {
            const isFavorite = false
            const { favorite, ...jobWithoutFavorite } = job;
            return {
                ...jobWithoutFavorite,
                isFavorite,
            };
        });
    }

    return {
        jobs,
        meta: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPage: Math.ceil(total / limitNum),
        },
    };
};

const getJobsDetailsForCandidate = async (jobId: any) => {

    const jobDetails = await Jobs.findById(jobId)
        .populate({
            path: "userId",
            select: "profile_image organization_types years_of_establishment company socialMedia"
        })
        .populate('category')
        .select("-favorite -applications")
        .lean();

    if (!jobDetails) {
        throw new ApiError(404, "Job Not Found")
    }

    const relatedJobs = await Jobs.find({
        // @ts-ignore
        category: jobDetails.category?._id,
        status: "Active"
    })
        .select("title category locations types experience education createdAt userId")
        .limit(6)
        .sort({ createdAt: -1 })
        .populate('category');

    return {
        jobDetails,
        relatedJobs
    };
};

export const JobsServices = {
    createNewJob,
    updateJobs,
    getEmployerJobs,
    applyJobs,
    getJobsApplications,
    getJobsDetails,
    makeExpireJobs,
    getAllApplyCandidate,
    addRemoveFavorites,
    getUserFavorites,
    getCandidateOverview,
    getCandidateJobAlert,
    allCategoryWithJobs,
    getRecentJobs,
    getSearchFilterJobs,
    getJobsDetailsForCandidate
}