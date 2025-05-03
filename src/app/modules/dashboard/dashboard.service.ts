import { Types } from "mongoose";
import QueryBuilder from "../../../builder/QueryBuilder";
import ApiError from "../../../errors/ApiError";
import { IReqUser } from "../auth/auth.interface";
import User from "../user/user.model";
import { Adds, Faq, PrivacyPolicy, Subscription, TermsConditions } from "./dashboard.model";
import { IAdds, IContactSupport, IRecipe, ISubscriptions } from "./dsashbaord.interface";
import { IUser } from "../user/user.interface";
import { logger } from "../../../shared/logger";
import { Transaction } from "../payment/payment.model";

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
    // const totalRecipe = await Recipe.countDocuments();

    return {
        totalIncome: totalIncome.length > 0 ? totalIncome[0].total : 0,
        totalUsers,
        // totalRecipe
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

const getMonthlyUserGrowth = async (year?: number) => {
    try {
        const currentYear = new Date().getFullYear();
        const selectedYear = year || currentYear;

        const { startDate, endDate } = getYearRange(selectedYear);

        const monthlyUserGrowth = await User.aggregate([
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

// =Subscriptions =================================
const createSubscriptions = async (payload: ISubscriptions) => {
    try {
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

// ===================================
const addsInsertIntoDB = async (files: any, payload: IAdds) => {
    if (!files?.image) {
        throw new ApiError(400, 'File is missing');
    }

    if (files?.image) {
        payload.image = `/images/image/${files.image[0].filename}`;
    }

    return await Adds.create(payload);
};

const allAdds = async (query: Record<string, unknown>) => {
    const addsQuery = new QueryBuilder(Adds.find(), query)
        .search([])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await addsQuery.modelQuery;
    const meta = await addsQuery.countTotal();

    return {
        meta,
        data: result,
    };
};

const updateAdds = async (req: any) => {
    const { files } = req as any;
    const id = req.params.id;
    const { ...AddsData } = req.body;

    console.log("AddsData", AddsData)

    if (files && files.image) {
        AddsData.image = `/images/image/${files.image[0].filename}`;
    }

    const isExist = await Adds.findOne({ _id: id });

    if (!isExist) {
        throw new ApiError(404, 'Adds not found !');
    }

    const result = await Adds.findOneAndUpdate(
        { _id: id },
        { ...AddsData },
        {
            new: true,
        },
    );
    console.log("result", result)
    return result;
};

const deleteAdds = async (id: string) => {
    const isExist = await Adds.findOne({ _id: id });
    if (!isExist) {
        throw new ApiError(404, 'Adds not found !');
    }
    return await Adds.findByIdAndDelete(id);
};

//! Faqs
const addFaq = async (payload: any) => {

    if (!payload?.questions || !payload?.answer) {
        throw new Error("Question and answer are required");
    }

    return await Faq.create(payload);
};

const updateFaq = async (req: any) => {
    const id = req.params.id

    const payload = req.body
    if (!payload?.questions || !payload?.answer) {
        throw new Error("Question and answer are required");
    }

    const result = await Faq.findByIdAndUpdate(id, payload, { new: true });

    return result
};
const deleteFaq = async (req: any) => {
    const id = req.params.id
    return await Faq.findByIdAndDelete(id);
};
const getFaq = async () => {
    return await Faq.find();
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


// getAllRecipes,
// createRecipes,
// updateRecipes,
// deleteRecipe,
// getMyRecipes,
// getRecipeDetails,
// getRecipesForYou,
// sendMessageSupport,
// getAllMessagesSupport,
// toggleFavorite,
// getUserFavorites

export const DashboardService = {
    totalCount,
    getAllUser,
    createSubscriptions,
    updateSubscription,
    addsInsertIntoDB,
    allAdds,
    updateAdds,
    deleteAdds,
    addFaq,
    updateFaq,
    deleteFaq,
    getFaq,
    addTermsConditions,
    getTermsConditions,
    addPrivacyPolicy,
    getPrivacyPolicy,
    getMonthlySubscriptionGrowth,
    getMonthlyUserGrowth,
    deleteSubscription
};