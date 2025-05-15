import mongoose, { Model, Schema, Types } from "mongoose";
import { IBlog, ICategory, IComment, IContactSupport, INutritional, IRecipe, IReview, ISubscriptions } from "./dsashbaord.interface";
import { string } from "zod";


const SubscriptionSchema = new Schema<ISubscriptions>({
    name: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true,
    },
    validation: {
        type: String,
        required: true,
        enum: ["Monthly", "Yearly"]
    },
    price: {
        type: Number,
        required: true
    },
    conditions: {
        type: [String],
        required: true
    },
    notice: {
        type: String,
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

const categorySchema = new Schema<ICategory>(
    {
        category: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
    }
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

const aboutUsSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: true,
        },
    }
);

const BlogSchema = new Schema<IBlog>({
    title: {
        type: String,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    descriptions: {
        type: String,
        required: true,
    },
    image: {
        type: [String],
        required: true
    }

}, { timestamps: true });


const Subscription: Model<ISubscriptions> = mongoose.model<ISubscriptions>('Subscription', SubscriptionSchema);
const Comment: Model<IComment> = mongoose.model<IComment>('Comment', CommentSchema);
const Review: Model<IReview> = mongoose.model<IReview>('Review', ReviewSchema);
const Category: Model<ICategory> = mongoose.model<ICategory>('Category', categorySchema);
const TermsConditions = mongoose.model('TermsConditions', termsAndConditionsSchema);
const PrivacyPolicy = mongoose.model('PrivacyPolicy', privacyPolicySchema);
const AboutUs = mongoose.model('AboutUs', aboutUsSchema);
const Blogs: Model<IBlog> = mongoose.model<IBlog>('Blog', BlogSchema);


export { Subscription, Comment, Review, Category, TermsConditions, PrivacyPolicy, AboutUs, Blogs };


// enum: ["African", "American", "Asian", "Caribbean", "Chinese", "Cuban", "East-African", "Ethiopian", "European", "French", "German", "Greek", "Indian", "Irish", "Israeli", "Italian", "Jamaican", "Japanese", "Korean", "Latin-American", "Mediterranean", "Mexican", "Middle-Eastern", "Moroccan", "North-African", "Persian", "Peruvian", "Puerto-Rican", "Russian", "Spanish", "Tex-Mex", "Thai", "Vietnamese", "West-African"],
