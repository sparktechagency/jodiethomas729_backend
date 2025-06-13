import { Schema, Types } from "mongoose";
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
import httpStatus from "http-status";
import Employer from "../employer/employer.model";

// ======================================
const createNewJob = async (user: IReqUser, payload: IJobs) => {
    const { authId, userId } = user;
    try {

        const parsedData = jobValidationSchema.parse(payload);

        const locations = {
            type: 'Point',
            coordinates: [parsedData.location.longitude, parsedData.location.latitude],
        };

        const jobData = {
            ...parsedData,
            authId: new Types.ObjectId(authId),
            userId: new Types.ObjectId(userId),
            locations,
        };
        // console.log('payload', jobData, authId)
        const job = new Jobs(jobData);
        await job.save();

        // 🔔 Trigger job alert logic
        await sendJobAlerts(job);

        return job;

    } catch (error: any) {
        console.log("payload", error)
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
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid job ID');
        }

        const parsedData = jobValidationSchema.partial().parse(payload);

        const job = await Jobs.findById(jobId);
        if (!job) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Job not found or unauthorized');
        }

        if (
            parsedData?.location &&
            parsedData.location?.longitude != null &&
            parsedData.location?.latitude != null
        ) {
            job.locations = {
                type: 'Point',
                coordinates: [
                    parsedData.location.longitude,
                    parsedData.location.latitude,
                ],
            };
        }

        // Remove the raw input location field (optional)
        delete (parsedData as any).location;

        // Assign remaining data
        Object.assign(job, parsedData);

        await job.save();

        return job;

    } catch (error: any) {
        if (error.name === 'ZodError') {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Job update failed: ' + error.errors.map((e: any) => e.message).join(', '));
        }
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Unexpected error while updating job');
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


    if (authId) {
        delete query.authId
    }

    const transitionQuery = new QueryBuilder(
        // @ts-ignore
        Jobs.find().select("title category salary application_dateline locations types experience education createdAt userId favorite")
            .populate("userId")
            .lean(),
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

// const getSearchFilterJobs = async (query: any) => {
//     let { experience,
//         types,
//         job_pattern,
//         category,
//         searchTrams,
//         maxDistance,
//         authId,
//         page = 1,
//         limit = 10,
//     } = query;

//     const filter: any = {
//         status: "Active",
//     };

//     let latitude: number | undefined;
//     let longitude: number | undefined;
//     let useGeoNear = false;

//     if (authId) {
//         const user = await User.findOne({ authId }).lean() as any;
//         if (!user) throw new ApiError(404, "Access denied. Only users are allowed.");

//         const coords = user?.locations?.coordinates;
//         if (!Array.isArray(coords) || coords.length !== 2) {
//             throw new ApiError(400, "Please set your location in your profile.");
//         }

//         [longitude, latitude] = coords;
//     }

//     const parseArray = (value: any) => {
//         try {
//             const parsed = JSON.parse(value);
//             return Array.isArray(parsed) ? parsed : [parsed];
//         } catch {
//             return Array.isArray(value) ? value : [value];
//         }
//     };

//     if (experience) filter.experience = { $in: parseArray(experience) };
//     if (types) filter.types = { $in: parseArray(types) };
//     if (job_pattern) filter.job_pattern = { $in: parseArray(job_pattern) };
//     if (category) filter.category = { $in: parseArray(category) };

//     const textFilters: any[] = [];
//     if (searchTrams) {
//         const searchRegex = new RegExp(searchTrams, "i");
//         textFilters.push({ title: searchRegex }, { skill: searchRegex }, { address: searchRegex });
//     }

//     // If maxDistance is given and user location is valid
//     if (maxDistance) {
//         if (!authId) throw new ApiError(404, "Please create an account to search jobs!");
//         if (!latitude || !longitude) throw new ApiError(404, "Please set a valid location in your profile.");
//         if (!Number(maxDistance)) throw new ApiError(404, "Invalid max distance.");

//         const maxDistanceInMeters = Number(maxDistance) * 1609.34;

//         filter.locations = {
//             $near: {
//                 $geometry: {
//                     type: "Point",
//                     coordinates: [longitude, latitude],
//                 },
//                 $maxDistance: maxDistanceInMeters,
//             },
//         };

//         useGeoNear = true;
//     }


//     if (textFilters.length > 0) {
//         filter.$or = textFilters;
//     }

//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);
//     const skip = (pageNum - 1) * limitNum;

//     let jobQuery = Jobs.find(filter)
//         .select("title category locations address types experience education createdAt userId favorite application_dateline salary")
//         .populate('category')
//         .populate({
//             path: "userId",
//             select: "profile_image organization_types years_of_establishment company"
//         })
//         .skip(skip)
//         .limit(limitNum)
//         .lean();

//     if (!useGeoNear) {
//         jobQuery = jobQuery.sort({ createdAt: -1 });
//     }

//     const [jobsRaw, total] = await Promise.all([
//         jobQuery,
//         Jobs.countDocuments(filter)
//     ]);

//     const jobs = jobsRaw.map((job: any) => {
//         const isFavorite = Array.isArray(job.favorite) && authId
//             ? job.favorite.some((id: any) => id.toString() === authId.toString())
//             : false;
//         const { favorite, ...jobWithoutFavorite } = job;
//         return {
//             ...jobWithoutFavorite,
//             isFavorite,
//         };
//     });

//     return {
//         jobs,
//         meta: {
//             page: pageNum,
//             limit: limitNum,
//             total,
//             totalPage: Math.ceil(total / limitNum),
//         },
//     };
// };


const getSearchFilterJobs = async (query: any) => {
    let { experience, types, job_pattern, category, searchTrams, maxDistance, authId, page = 1, limit = 10, } = query;

    const matchStage: any = {
        status: "Active",
    };

    let latitude: number | undefined;
    let longitude: number | undefined;

    if (authId) {
        const user = await User.findOne({ authId }).lean() as any;
        if (!user) throw new ApiError(404, "Access denied. Only users are allowed.");
        const coords = user?.locations?.coordinates;
        if (!Array.isArray(coords) || coords.length !== 2) {
            throw new ApiError(400, "Please set your location in your profile.");
        }
        [longitude, latitude] = coords;
    }

    const parseArray = (value: any) => {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            return Array.isArray(value) ? value : [value];
        }
    };

    if (experience) matchStage.experience = { $in: parseArray(experience) };
    if (types) matchStage.types = { $in: parseArray(types) };
    if (job_pattern) matchStage.job_pattern = { $in: parseArray(job_pattern) };
    if (category) matchStage.category = { $in: parseArray(category) };

    const textFilters: any[] = [];
    if (searchTrams) {
        const regex = new RegExp(searchTrams, "i");
        textFilters.push({ title: regex }, { skill: regex }, { address: regex });
    }
    if (textFilters.length > 0) {
        matchStage.$or = textFilters;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let jobs = [];
    let total = 0;

    if (maxDistance) {
        if (!authId) throw new ApiError(404, "Please create an account to search jobs!");
        if (!latitude || !longitude) throw new ApiError(404, "Please set a valid location in your profile.");
        if (!Number(maxDistance)) throw new ApiError(404, "Invalid max distance.");

        const maxDistanceInMeters = Number(maxDistance) * 1609.34;

        const pipeline: any[] = [
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [longitude, latitude],
                    },
                    distanceField: "distance",
                    spherical: true,
                    maxDistance: maxDistanceInMeters,
                    key: "locations",
                },
            },
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limitNum },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId",
                },
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    title: 1,
                    category: 1,
                    locations: 1,
                    address: 1,
                    types: 1,
                    experience: 1,
                    education: 1,
                    createdAt: 1,
                    application_dateline: 1,
                    salary: 1,
                    "userId.profile_image": 1,
                    "userId.company": 1,
                    "userId.name": 1,
                    favorite: 1,
                },
            },
        ];

        jobs = await Jobs.aggregate(pipeline);
        total = await Jobs.countDocuments(matchStage);
    } else {
        const jobQuery = Jobs.find(matchStage)
            .select("title category locations address types experience education createdAt userId favorite application_dateline salary")
            .populate("category")
            .populate({
                path: "userId",
                select: "profile_image name company",
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        [jobs, total] = await Promise.all([
            jobQuery,
            Jobs.countDocuments(matchStage),
        ]);
    }

    const finalJobs = jobs.map((job: any) => {
        const isFavorite =
            Array.isArray(job.favorite) && authId
                ? job.favorite.some((id: any) => id.toString() === authId.toString())
                : false;
        const { favorite, ...rest } = job;
        return {
            ...rest,
            isFavorite,
        };
    });

    return {
        jobs: finalJobs,
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
    const {
        page = 1,
        limit = 10,
        education,
        experience,
        searchTrams,
        maxDistance
    } = query;

    const { userId, authId } = user;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};

    const parseArray = (value: any): any[] => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            return [value];
        }
    };

    if (education) filter.education = { $in: parseArray(education) };
    if (experience) filter.experience = { $in: parseArray(experience) };

    if (searchTrams) {
        const regex = new RegExp(searchTrams, "i");
        filter.$or = [
            { name: regex },
            { skill: regex },
            { address: regex },
        ];
    }

    // Geo Filtering (Optional)
    if (maxDistance) {
        const distanceMiles = Number(maxDistance);
        if (isNaN(distanceMiles) || distanceMiles <= 0) {
            throw new ApiError(400, "Invalid max distance.");
        }

        const employer = await Employer.findOne({ authId }).lean();
        if (!employer) {
            throw new ApiError(404, "Access denied. Only employers are allowed.");
        }

        const coords = employer?.locations?.coordinates;
        if (!Array.isArray(coords) || coords.length !== 2) {
            throw new ApiError(400, "Please set a valid location in your profile.");
        }

        const [longitude, latitude] = coords;
        const maxDistanceInMeters = distanceMiles * 1609.34;

        const geoCandidates = await User.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    distanceField: "distance",
                    spherical: true,
                    maxDistance: maxDistanceInMeters,
                    key: "locations"
                }
            },
            { $match: filter },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limitNum },
            {
                $project: {
                    name: 1,
                    email: 1,
                    profile_image: 1,
                    skill: 1,
                    details: 1,
                    address: 1,
                    profile_private: 1,
                    profile_access: 1,
                    favorite: 1
                }
            }
        ]);

        const total = await User.countDocuments(filter);

        const result = geoCandidates.map((u: any) => {
            const hasAccess = u.profile_access?.some((entry: any) =>
                entry.eId?.toString() === userId && entry.access === true
            );
            if (hasAccess) u.profile_private = false;
            delete u.profile_access;

            const isFavorite = Array.isArray(u.favorite) &&
                u.favorite.some((id: any) => id.toString() === authId?.toString());
            const { favorite, ...userData } = u;
            return { ...userData, isFavorite };
        });

        return {
            result,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        };
    }

    const users = await User.find(filter)
        .select('name email profile_image skill details address profile_private profile_access favorite')
        .skip(skip)
        .limit(limitNum)
        .lean();

    const total = await User.countDocuments(filter);

    let result = users.map((u: any) => {
        const hasAccess = u.profile_access?.some((entry: any) =>
            entry.eId?.toString() === userId && entry.access === true
        );
        if (hasAccess) u.profile_private = false;
        delete u.profile_access;

        const isFavorite = Array.isArray(u.favorite) &&
            u.favorite.some((id: any) => id.toString() === authId?.toString());

        const { favorite, ...userData } = u;
        return { ...userData, isFavorite };
    });

    return {
        result,
        meta: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
        }
    };
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

const getTotalCountEmployer = async (user: IReqUser) => {
    const { userId } = user;

    const jobs = await Jobs.find({ userId }, 'applications');

    const totalJobs = jobs.length;

    const totalApplications = jobs.reduce((sum, job) => {
        return sum + (job.applications?.length || 0);
    }, 0);

    return {
        totalJobs,
        totalApplications,
    };
};

const getTotalCountCandidate = async (user: IReqUser) => {
    const { userId } = user;

    const applications = await Applications.find({ userId });
    const totalApplications = applications.length;

    const jobs = await Jobs.find({ favorite: { $in: [userId] } });
    const favoriteJobs = jobs.length;

    return {
        totalApplications,
        favoriteJobs,
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
    getUserFavoriteList,
    getTotalCountEmployer,
    getTotalCountCandidate
}