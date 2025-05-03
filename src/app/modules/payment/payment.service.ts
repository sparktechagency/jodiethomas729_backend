import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { IReqUser } from "../auth/auth.interface";
import User from "../user/user.model";
import { IUser } from "../user/user.interface";
import { Subscription } from "../dashboard/dashboard.model";
import config from "../../../config";
import { ISubscriptions } from "../dashboard/dsashbaord.interface";
import { Transaction } from "./payment.model";
import cron from "node-cron";
import { logger } from "../../../shared/logger";
import QueryBuilder from "../../../builder/QueryBuilder";

const stripe = require("stripe")(config.stripe.stripe_secret_key);
const DOMAIN_URL = process.env.SERVER_PASS_UI_LINK;

cron.schedule("0 0 */12 * * *", async () => {
    try {
        const now = new Date();
        const result = await User.updateMany(
            {
                subscription_status: "Active",
                duration_time: { $lte: now },
            },
            {
                $set: { subscription_status: "Expired" },
            }
        );
        console.log("********************************************************=======================================================================###################################################**************************************************************************")
        if (result.modifiedCount > 0) {
            logger.info(`Removed activation codes from ${result.modifiedCount} expired inactive users`);
        }
    } catch (error) {
        logger.error("Error removing activation codes from expired users:", error);
    }
});

const createCheckoutSessionStripe = async (req: any) => {
    try {
        const { subscriptionId } = req.body as any;
        const { userId, role } = req.user as IReqUser;

        if (!subscriptionId) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required fields.');
        }

        const user = await User.findById(userId) as IUser;
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found.');
        }

        const subscription = await Subscription.findById(subscriptionId) as ISubscriptions
        if (!subscription) {
            throw new ApiError(httpStatus.NOT_FOUND, 'invalid subscription ID.');
        }

        const unitAmount = Number(subscription.fee) * 100;

        let session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${DOMAIN_URL}/payment/stripe-webhooks?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${DOMAIN_URL}/cancel`,
            customer_email: `${user?.email}`,
            client_reference_id: subscriptionId,
            metadata: {
                payUser: userId,
                subscriptionId: subscriptionId,
            },
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: unitAmount,
                        product_data: {
                            name: subscription.name,
                            description: subscription?.description
                        }
                    },
                    quantity: 1
                }
            ]
        })

        return { url: session.url };

    } catch (error: any) {
        throw new ApiError(400, error);
    }
};

const stripeCheckAndUpdateStatusSuccess = async (req: any) => {
    const sessionId = req.query.session_id;

    if (!sessionId) {
        return { status: "failed", message: "Missing session ID in the request." };
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return { status: "failed", message: "Session not found." };
        }

        if (session.payment_status !== 'paid') {
            return { status: "failed", message: "Payment not approved." };
        }

        const { payUser, subscriptionId } = session.metadata;

        const subscription = await Subscription.findById(subscriptionId) as ISubscriptions;
        if (!subscription) {
            return {
                status: "failed",
                message: "Subscription not found!",
                text: 'Payment succeeded, but the subscription could not be found. Please contact support.'
            };
        }

        const amount = Number(session.amount_total) / 100;

        const transactionData = {
            subscriptionId,
            userId: payUser,
            amount: amount,
            paymentStatus: "Completed",
            transactionId: session.payment_intent,
            paymentDetails: {
                email: session.customer_email,
                payId: sessionId,
                currency: "USD"
            }
        };
        const newTransaction = await Transaction.create(transactionData);

        let user = await User.findById(payUser) as any;
        const expiryDate = new Date();

        if (subscription.duration === "Monthly") {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
            user.duration_time = expiryDate;
            user.subscription_status = "Active";
        } else if (subscription.duration === "Yearly") {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            user.duration_time = expiryDate;
            user.subscription_status = "Active";
        } else {
            user.subscription_status = "None";
        }

        await user.save();

        return { status: "success", result: newTransaction };

    } catch (error: any) {
        console.error('Error processing Stripe payment:', error);
        return { status: "failed", message: "Payment execution failed", error: error.message };
    }
};

// ======================================
const getAllTransactions = async (query: any) => {
    const { page, limit, searchTerm } = query;

    if (query?.searchTerm) {
        delete query.page;
    }
    const transationQuery = new QueryBuilder(Transaction.find()
        .populate({
            path: "userId",
            select: "name email profile_image",
        })
        .populate({
            path: "subscriptionId",
            select: "name",
        })
        , query)
        .search(["transactionId", "userEmail"])
        .filter()
        .sort()
        .paginate()
        .fields()

    const result = await transationQuery.modelQuery;
    const meta = await transationQuery.countTotal();
    // console.log(result)
    return { result, meta };

};

export const PaymentServices = {
    createCheckoutSessionStripe,
    stripeCheckAndUpdateStatusSuccess,
    getAllTransactions
}