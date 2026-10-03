import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        contentType: {
            type: String,
            enum: ["article", "video"],
            default: "article",
        },

        videoUrl: {
            type: String,
            default: "",
            trim: true,
        },

        thumbnail: {
            type: String,
            default: "",
            trim: true,
        },

        duration: {
            type: String,
            default: "",
            trim: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        excerpt: {
            type: String,
            default: "",
            maxlength: 500,
            trim: true,
        },

        // Video blogs can have empty content
        content: {
            type: String,
            default: "",
        },

        coverImage: {
            type: String,
            default: "",
            trim: true,
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        tags: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        views: {
            type: Number,
            default: 0,
        },

        published: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

blogSchema.index({
    title: "text",
    content: "text",
    tags: "text",
});

export default mongoose.model("Blog", blogSchema);