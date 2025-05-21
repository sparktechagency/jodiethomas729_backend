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
import Notification from "../notifications/notifications.model";
import { IUser } from "../user/user.interface";

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

const getUserFavoritesJobs = async (user: IReqUser) => {
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
// ==========================================
const searchCandidate = async (user: IReqUser, query: any) => {
    const { page = 1, limit = 10, education, experience, category } = query;
    const { userId, authId } = user;
    const filter: any = {};
    const parseArray = (value: any) => {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            return Array.isArray(value) ? value : [value];
        }
    };

    if (education && education.length > 0) {
        filter.education = { $in: parseArray(education) };
    }

    if (experience && experience.length > 0) {
        filter.experience = { $in: parseArray(experience) };
    }

    if (category && category.length > 0) {
        filter.category = { $in: parseArray(category) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter).lean()
        .select('name email profile_image skill details permanent_address present_address profile_private profile_access favorite')
        .skip(skip)
        .limit(parseInt(limit));

    let result = users.map((u: any) => {
        const hasAccess = u.profile_access?.some((entry: any) =>
            entry.eId?.toString() === userId && entry.access === true
        );
        if (hasAccess) {
            u.profile_private = false;
        }
        delete u.profile_access;
        return u;
    });

    if (result?.length && authId) {
        result = result?.map((user: any) => {
            const isFavorite = Array.isArray(user.favorite) && user.favorite.some((id: any) => id.toString() === authId.toString());
            const { favorite, ...jobWithoutFavorite } = user;
            return {
                ...jobWithoutFavorite,
                isFavorite,
            };
        });
    }


    const total = await User.countDocuments(filter);

    const meta = {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
    };

    return { result, meta };
};

const profileAccessRequest = async (user: IReqUser, userId: string) => {
    const { userId: employerId } = user;

    try {
        const targetUser = await User.findById(userId);

        if (!targetUser) {
            throw new AppError(404, "User not found.");
        }

        if (!targetUser.profile_private) {
            throw new AppError(400, "User profile is publicly open!");
        }

        const existingAccess = targetUser.profile_access.find(
            (entry: any) => entry.eId.toString() === employerId
        );

        if (existingAccess) {
            if (existingAccess.access === false) {
                throw new AppError(400, "Access request already sent.");
            } else if (existingAccess.access === true) {
                throw new AppError(400, "Your access request has already been accepted.");
            }
        }

        const result = await User.findByIdAndUpdate(
            userId,
            {
                $push: {
                    profile_access: {
                        eId: employerId,
                        access: false,
                    },
                },
            },
            { new: true }
        );

        // Create notification (assuming you have Notification model)
        await Notification.create({
            userId: userId,
            senderId: employerId,
            userIdType: "User",
            senderIdType: "Employer",
            type: "profile_access_request",
            title: "New Profile Access Request",
            message: "You have a new profile access request.",
        });

        return {
            data: "Profile access request sent successfully.",
        };
    } catch (error: any) {
        throw new AppError(500, error.message);
    }
};

const acceptAccessRequest = async (user: IReqUser, employerId: string) => {
    const { userId } = user;

    try {
        const targetUser = await User.findById(userId);

        if (!targetUser) {
            throw new AppError(404, "User not found.");
        }

        const accessRequest = targetUser.profile_access.find(
            (entry: any) => entry.eId.toString() === employerId
        );

        if (!accessRequest) {
            throw new AppError(400, "No access request found from this employer.");
        }

        if (accessRequest.access === true) {
            throw new AppError(400, "Your request has already been accepted.");
        }

        const result = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    "profile_access.$[elem].access": true,
                },
            },
            {
                arrayFilters: [{ "elem.eId": employerId }],
                new: true,
            }
        );

        // Create a notification for the employer
        await Notification.create({
            userId: employerId,
            senderId: userId,
            userIdType: "Employer",
            senderIdType: "User",
            type: "profile_access_accepted",
            title: `Profile Access Request Accepted`,
            message: `${targetUser.name}'s profile access request has been accepted.`,
        });

        return {
            data: "Access request accepted successfully.",
        };
    } catch (error: any) {
        throw new AppError(500, error.message);
    }
};

const getUserProfileDetails = async (user: IReqUser, userId: any) => {
    const { userId: employerId } = user;

    const userDetails = await User.findById(userId)
        .populate('category')
        .select("-favorite")
        .lean();

    if (!userDetails) {
        throw new ApiError(404, "User Not Found!")
    }

    if (userDetails.profile_private) {
        const hasAccess = userDetails.profile_access?.some((entry: any) =>
            entry.eId?.toString() === employerId && entry.access === true
        );
        if (!hasAccess) {
            throw new ApiError(400, "You have not access for view this profile details")
        }
        // @ts-ignore
        delete userDetails.profile_access;
    }

    return {
        userDetails
    };
};

const toggleUserFavorite = async (authId: Schema.Types.ObjectId, userId: Types.ObjectId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    // @ts-ignore
    const isFavorites = user.favorite.includes(authId);
    if (isFavorites) {
        user.favorite = user.favorite.filter(id => id.toString() !== authId.toString());
    } else {
        // @ts-ignore
        user.favorite.push(authId);
    }
    await user.save();

    return { message: isFavorites ? "Removed from favorites" : "Added to favorites" };
};

const getUserFavoriteList = async (authId: any, query: any) => {
    const { page = 1, limit = 10 } = query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [result, total] = await Promise.all([
        User.find({ favorite: { $in: [authId] } })
            .select('name email profile_image skill details permanent_address present_address profile_private')
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),

        User.countDocuments({ favorite: { $in: [authId] } })
    ]);

    const updatedUser = result.map(user => ({
        ...user,
        isFavorite: true
    }));

    const meta = {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPage: Math.ceil(total / limit)
    };

    return { users: updatedUser, meta };
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
    getUserFavoritesJobs,
    getCandidateOverview,
    getCandidateJobAlert,
    allCategoryWithJobs,
    getRecentJobs,
    getSearchFilterJobs,
    getJobsDetailsForCandidate,
    searchCandidate,
    profileAccessRequest,
    acceptAccessRequest,
    getUserProfileDetails,
    toggleUserFavorite,
    getUserFavoriteList
}