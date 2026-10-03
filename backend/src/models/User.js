import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        // ==========================================
        // BASIC USER INFORMATION
        // ==========================================

        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50,
        },

        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },

        // ==========================================
        // PROFILE
        // ==========================================

        avatar: {
            type: String,
            default: "",
        },

        bio: {
            type: String,
            default: "",
            maxlength: 500,
        },

        // ==========================================
        // ROLE
        // ==========================================

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

        // ==========================================
        // FOLLOW SYSTEM
        // ==========================================

        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        // ==========================================
        // BOOKMARKS
        // ==========================================

        bookmarks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Blog",
            },
        ],
    },

    {
        timestamps: true,
    }
);

// ==========================================
// PREVENT DUPLICATE FOLLOWERS / FOLLOWING
// ==========================================

userSchema.pre("save", function (next) {
    if (this.isModified("followers")) {
        this.followers = [
            ...new Map(
                this.followers.map((id) => [
                    id.toString(),
                    id,
                ])
            ).values(),
        ];
    }

    if (this.isModified("following")) {
        this.following = [
            ...new Map(
                this.following.map((id) => [
                    id.toString(),
                    id,
                ])
            ).values(),
        ];
    }

    next();
});

export default mongoose.model(
    "User",
    userSchema
);