import mongoose, { Model, Schema, Types } from "mongoose";
import { IAdds, IComment, IContactSupport, INutritional, IRecipe, IReview, ISubscriptions } from "./dsashbaord.interface";
import { string } from "zod";


const SubscriptionSchema = new Schema<ISubscriptions>({
    name: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true,
        enum: ["Monthly", "Yearly"]
    },
    fee: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });


const CommentSchema = new Schema<IComment>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    replay: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    text: {
        type: String,
        required: true
    }
})

const ReviewSchema = new Schema<IReview>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    review: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    feedback: {
        type: String,
        required: true,
    },
});

const nutritionalSchema = new Schema<INutritional>({
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, required: true }
})


const addsSchema = new Schema<IAdds>(
    {
        url: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
    }
);

const faqSchema = new mongoose.Schema(
    {
        questions: {
            type: String,
            required: true,
        },
        answer: {
            type: String,
            required: true,
        },
    },
);

const termsAndConditionsSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: true,
        },
    }
);

const privacyPolicySchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: true,
        },
    }
);

const Subscription: Model<ISubscriptions> = mongoose.model<ISubscriptions>('Subscription', SubscriptionSchema);
const Comment: Model<IComment> = mongoose.model<IComment>('Comment', CommentSchema);
const Review: Model<IReview> = mongoose.model<IReview>('Review', ReviewSchema);
const Adds: Model<IAdds> = mongoose.model<IAdds>('Adds', addsSchema);
const Faq = mongoose.model('Faq', faqSchema);
const TermsConditions = mongoose.model('TermsConditions', termsAndConditionsSchema);
const PrivacyPolicy = mongoose.model('PrivacyPolicy', privacyPolicySchema);


export { Subscription, Comment, Review, Adds, Faq, TermsConditions, PrivacyPolicy };


// enum: ["African", "American", "Asian", "Caribbean", "Chinese", "Cuban", "East-African", "Ethiopian", "European", "French", "German", "Greek", "Indian", "Irish", "Israeli", "Italian", "Jamaican", "Japanese", "Korean", "Latin-American", "Mediterranean", "Mexican", "Middle-Eastern", "Moroccan", "North-African", "Persian", "Peruvian", "Puerto-Rican", "Russian", "Spanish", "Tex-Mex", "Thai", "Vietnamese", "West-African"],
