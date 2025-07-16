import mongoose, { Model, Schema, Types } from "mongoose";
import { IBanner, IBlog, ICategory, IComment, IContactSupport, INutritional, IRecipe, IReview, ISubscriptions } from "./dsashbaord.interface";
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
    }, { timestamps: true }
);

const termsAndConditionsSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: true,
        },
    }
);

const bannerSchema = new Schema<IBanner>(
    {
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
    }, { timestamps: true }
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
        type: String,
        enum: ["industry_insights", "career_&_skills", "business_&_hiring", "mindset_&_growth", "real_stories"],
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

const ContactUsSchema = new Schema<IContactSupport>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true
    },
    reply: {
        type: String,
        default: null
    }
}, { timestamps: true });


const Subscription: Model<ISubscriptions> = mongoose.model<ISubscriptions>('Subscription', SubscriptionSchema);
const Comment: Model<IComment> = mongoose.model<IComment>('Comment', CommentSchema);
const Review: Model<IReview> = mongoose.model<IReview>('Review', ReviewSchema);
const Category: Model<ICategory> = mongoose.model<ICategory>('Category', categorySchema);
const Banner: Model<IBanner> = mongoose.model<IBanner>('Banner', bannerSchema);
const TermsConditions = mongoose.model('TermsConditions', termsAndConditionsSchema);
const PrivacyPolicy = mongoose.model('PrivacyPolicy', privacyPolicySchema);
const AboutUs = mongoose.model('AboutUs', aboutUsSchema);
const Blogs: Model<IBlog> = mongoose.model<IBlog>('Blog', BlogSchema);
const ContactUs: Model<IContactSupport> = mongoose.model<IContactSupport>('ContactUs', ContactUsSchema);

export { Subscription, Comment, Review, Category, TermsConditions, PrivacyPolicy, AboutUs, Blogs, ContactUs, Banner };

