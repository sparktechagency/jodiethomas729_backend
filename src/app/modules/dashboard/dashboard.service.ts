import QueryBuilder from "../../../builder/QueryBuilder";
import ApiError from "../../../errors/ApiError";
import User from "../user/user.model";
import { AboutUs, Category, PrivacyPolicy, Subscription, TermsConditions } from "./dashboard.model";
import { ICategory, ISubscriptions } from "./dsashbaord.interface";
import { logger } from "../../../shared/logger";
import { Transaction } from "../payment/payment.model";
import Employer from "../employer/employer.model";
import { IReqUser } from "../auth/auth.interface";
import { ENUM_USER_ROLE } from "../../../enums/user";
import { Applications, Jobs } from "../jobs/jobs.model";
import Auth from "../auth/auth.model";

// ===========================================
const getYearRange = (year: any) => {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    return { startDate, endDate };
};

const totalCount = async () => {

    const totalIncome = await Transaction.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' },
            },
        },
    ]);

    const totalUsers = await User.countDocuments();
    const totalEmployer = await Employer.countDocuments();
    const totalJobs = await Jobs.countDocuments();

    return {
        totalIncome: totalIncome.length > 0 ? totalIncome[0].total : 0,
        totalUsers,
        totalEmployer,
        totalJobs
    };
};

const getMonthlySubscriptionGrowth = async (year?: number) => {
    try {
        const currentYear = new Date().getFullYear();
        const selectedYear = year || currentYear;

        const { startDate, endDate } = getYearRange(selectedYear);

        const monthlySubscriptionGrowth = await Subscription.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lt: endDate,
                    },
                },
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    month: '$_id.month',
                    year: '$_id.year',
                    count: 1,
                },
            },
            {
                $sort: { month: 1 },
            },
        ]);

        const months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];

        const result = Array.from({ length: 12 }, (_, i) => {
            const monthData = monthlySubscriptionGrowth.find(
                data => data.month === i + 1,
            ) || { month: i + 1, count: 0, year: selectedYear };
            return {
                ...monthData,
                month: months[i],
            };
        });

        return {
            year: selectedYear,
            data: result,
        };
    } catch (error) {
        console.error('Error in getMonthlySubscriptionGrowth function: ', error);
        throw error;
    }
};

const getMonthlyJobsGrowth = async (year?: number) => {
    try {
        const currentYear = new Date().getFullYear();
        const selectedYear = year || currentYear;

        const { startDate, endDate } = getYearRange(selectedYear);

        const monthlyUserGrowth = await Jobs.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lt: endDate,
                    },
                },
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    month: '$_id.month',
                    year: '$_id.year',
                    count: 1,
                },
            },
            {
                $sort: { month: 1 },
            },
        ]);

        const months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];

        const result = [];
        for (let i = 1; i <= 12; i++) {
            const monthData = monthlyUserGrowth.find(data => data.month === i) || {
                month: i,
                count: 0,
                year: selectedYear,
            };
            result.push({
                ...monthData,
                month: months[i - 1],
            });
        }

        return {
            year: selectedYear,
            data: result,
        };
    } catch (error) {
        logger.error('Error in getMonthlyUserGrowth function: ', error);
        throw error;
    }
};

// ===========================================
const getAllUser = async (query: any) => {
    const { page, limit, searchTerm } = query;

    if (query?.searchTerm) {
        delete query.page;
    }
    const userQuery = new QueryBuilder(User.find()
        , query)
        .search(["name", "email"])
        .filter()
        .sort()
        .paginate()
        .fields()

    const result = await userQuery.modelQuery;
    const meta = await userQuery.countTotal();

    console.log(result)

    return { result, meta };

};
// ===========================================
const checkActiveSubscriber = async (user: IReqUser) => {
    try {
        const { userId, authId, role } = user as IReqUser;

        if (role !== ENUM_USER_ROLE.EMPLOYER) {
            throw new ApiError(401, `You are not unauthorized for access. Must need role EMPLOYER.`);
        }

        const employer = await Employer.findById(userId).select("authId name email subscription_status duration_time");

        if (!employer) {
            throw new ApiError(404, "Employer not found.");
        }

        const isActive = employer.subscription_status === "Active";

        return {
            ...employer.toObject(),
            subscription: isActive
        };
    } catch (error: any) {
        throw new ApiError(400, `Error checking subscription: ${error.message}`);
    }
};

// =Subscriptions =================================
const createSubscriptions = async (payload: ISubscriptions) => {
    try {
        if (payload?.validation === "Monthly") {
            payload.duration = 30 // days
        } else if (payload?.validation === "Yearly") {
            payload.duration = 365 // days
        } else {
            throw new ApiError(404, "Invalids 'validation' types. should - Monthly / Yearly")
        }
        const subscription = new Subscription(payload);
        await subscription.save();
        return subscription;
    } catch (error: any) {
        throw new ApiError(400, `Error creating subscription: ${error.message}`);
    }

};

const updateSubscription = async (id: string, payload: Partial<ISubscriptions>) => {
    try {
        const updatedSubscription = await Subscription.findByIdAndUpdate(id, payload, { new: true });
        if (!updatedSubscription) {
            throw new ApiError(404, 'Subscription not found');
        }
        return updatedSubscription;
    } catch (error: any) {
        throw new ApiError(400, `Error updating subscription: ${error.message}`);
    }
};

const deleteSubscription = async (id: string) => {
    try {
        const deletedSubscription = await Subscription.findByIdAndDelete(id);
        if (!deletedSubscription) {
            throw new ApiError(404, 'Subscription not found');
        }
        return deletedSubscription;
    } catch (error: any) {
        throw new ApiError(400, `Error deleting subscription: ${error.message}`);
    }
};

const getAllSubscriber = async (query: any) => {
    const cleanQuery = { ...query };

    if (cleanQuery?.searchTerm) {
        delete cleanQuery.page;
    }

    const userQuery = new QueryBuilder(
        Employer.find({ subscription_status: { $in: ["Active", "Expired"] } }),
        cleanQuery
    )
        .search(["name", "email"])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await userQuery.modelQuery;
    const meta = await userQuery.countTotal();

    return { result, meta };
};

// ===================================
const categoryInsertIntoDB = async (files: any, payload: ICategory) => {
    if (!files?.image) {
        throw new ApiError(400, 'File is missing');
    }

    if (files?.image) {
        payload.image = `/images/image/${files.image[0].filename}`;
    }

    return await Category.create(payload);
};

const allCategory = async (query: Record<string, unknown>) => {
    const categoryQuery = new QueryBuilder(Category.find(), query)
        .search(['category'])
        .filter()
        .fields();

    const result = await categoryQuery.modelQuery;

    return {
        data: result,
    };
};

const updateCategory = async (req: any) => {
    const { files } = req as any;
    const id = req.params.id;
    const { ...AddsData } = req.body;

    console.log("AddsData", AddsData)

    if (files && files.image) {
        AddsData.image = `/images/image/${files.image[0].filename}`;
    }

    const isExist = await Category.findOne({ _id: id });

    if (!isExist) {
        throw new ApiError(404, 'Adds not found !');
    }

    const result = await Category.findOneAndUpdate(
        { _id: id },
        { ...AddsData },
        {
            new: true,
        },
    );
    console.log("result", result)
    return result;
};

const deleteCategory = async (id: string) => {
    const isExist = await Category.findOne({ _id: id });
    if (!isExist) {
        throw new ApiError(404, 'Category not found !');
    }
    return await Category.findByIdAndDelete(id);
};

// ==============
const addTermsConditions = async (payload: any) => {
    const checkIsExist = await TermsConditions.findOne();
    if (checkIsExist) {
        return await TermsConditions.findOneAndUpdate({}, payload, {
            new: true,

            runValidators: true,
        });
    } else {
        return await TermsConditions.create(payload);
    }
};

const getTermsConditions = async () => {
    return await TermsConditions.findOne();
};

const addPrivacyPolicy = async (payload: any) => {
    const checkIsExist = await PrivacyPolicy.findOne();
    if (checkIsExist) {
        return await PrivacyPolicy.findOneAndUpdate({}, payload, {
            new: true,

            runValidators: true,
        });
    } else {
        return await PrivacyPolicy.create(payload);
    }
};

const getPrivacyPolicy = async () => {
    return await PrivacyPolicy.findOne();
};

const addAboutUs = async (payload: any) => {
    const checkIsExist = await AboutUs.findOne();
    if (checkIsExist) {
        return await AboutUs.findOneAndUpdate({}, payload, {
            new: true,

            runValidators: true,
        });
    } else {
        return await AboutUs.create(payload);
    }
};

const getAboutUs = async () => {
    return await AboutUs.findOne();
};

const getAllEmployer = async (query: any) => {

    if (query?.searchTerm) {
        delete query.page;
    }

    const userQuery = new QueryBuilder(Employer.find()
        , query)
        .search(["name", "email"])
        .filter()
        .sort()
        .paginate()
        .fields()

    const result = await userQuery.modelQuery;
    const meta = await userQuery.countTotal();

    console.log(result)

    return { result, meta };
};

const getEmployerDetails = async (query: any, userId: any) => {

    if (query?.searchTerm) {
        delete query.page;
    }

    const employer = await Employer.findById(userId)


    // query.userId = userId

    const userQuery = new QueryBuilder(Jobs.find({ userId })
        , query)
        .filter()
        .sort()
        .paginate()
        .fields()

    const result = await userQuery?.modelQuery;
    const meta = await userQuery?.countTotal();

    console.log(result)

    return { employer, result, meta };

};

const getAllCandidate = async (query: any) => {

    if (query?.searchTerm) {
        delete query.page;
    }

    const userQuery = new QueryBuilder(
        // @ts-ignore
        User.find().select('-profile_access -favorite'),
        query
    )

        .search(["name", "email"])
        .filter()
        .sort()
        .paginate()
        .fields()

    const result = await userQuery.modelQuery;
    const meta = await userQuery.countTotal();

    console.log(result)

    return { result, meta };
};


const getCandidateDetails = async (query: any, userId: any) => {

    if (query?.searchTerm) {
        delete query.page;
    }

    const userDetails = await User.findById(userId)


    // query.userId = userId

    const userQuery = new QueryBuilder(Applications.find({ userId })
        .populate("jobId")
        , query)
        .filter()
        .sort()
        .paginate()
        .fields()

    const result = await userQuery?.modelQuery;
    const meta = await userQuery?.countTotal();

    console.log(result)

    return { userDetails, result, meta };

};

export const DashboardService = {
    totalCount,
    getAllUser,
    createSubscriptions,
    updateSubscription,
    categoryInsertIntoDB,
    allCategory,
    updateCategory,
    deleteCategory,
    addTermsConditions,
    getTermsConditions,
    addPrivacyPolicy,
    getPrivacyPolicy,
    getMonthlySubscriptionGrowth,
    getMonthlyJobsGrowth,
    deleteSubscription,
    getAboutUs,
    addAboutUs,
    getAllSubscriber,
    checkActiveSubscriber,
    getAllEmployer,
    getEmployerDetails,
    getAllCandidate,
    getCandidateDetails
};