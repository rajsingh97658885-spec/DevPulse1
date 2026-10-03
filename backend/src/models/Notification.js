import mongoose from "mongoose";

const notificationSchema =
    new mongoose.Schema(
        {
            recipient: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },

            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null
            },

            type: {
                type: String,
                enum: [
                    "like",
                    "comment",
                    "reply",
                    "follow",
                    "system"
                ],
                required: true
            },

            message: {
                type: String,
                required: true
            },

            blog: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Blog",
                default: null
            },

            read: {
                type: Boolean,
                default: false
            }
        },
        {
            timestamps: true
        }
    );

export default mongoose.model(
    "Notification",
    notificationSchema
);