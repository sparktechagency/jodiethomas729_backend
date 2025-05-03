import { Schema, Types } from "mongoose";

export interface ITransaction extends Document {
    subscriptionId: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
    amount: number;
    transactionId: string;
    paymentStatus: string;
    paymentDetails: any;
    userEmail: string;
}