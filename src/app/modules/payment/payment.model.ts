import mongoose, { Schema, Types } from "mongoose";
import { ITransaction } from "./payment.interface";


const transactionSchema = new Schema<ITransaction>({
    subscriptionId: {
        type: Types.ObjectId,
        ref: 'Subscription',
        required: true,
    },
    userId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userEmail: {
        type: String,
        required: true
    },
    amount: {
        type: Number
    },
    transactionId: {
        type: String,
        trim: true,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['Completed', 'Pending', 'Failed', 'Refunded'],
        required: true,
    },
    paymentDetails: {
        email: {
            type: String,
        },
        payId: {
            type: String,
        },
        currency: {
            type: String,
            default: 'USD',
        },
    }
}, { timestamps: true });


const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
export { Transaction };