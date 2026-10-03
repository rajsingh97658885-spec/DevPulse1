import Notification from "../models/Notification.js";

export const getNotifications =
    async (
        req,
        res,
        next
    ) => {
        try {
            const notifications =
                await Notification.find({
                    recipient:
                        req.user._id
                })
                    .populate(
                        "sender",
                        "name username avatar"
                    )
                    .populate(
                        "blog",
                        "title"
                    )
                    .sort({
                        createdAt: -1
                    });

            res.json({
                success: true,
                notifications
            });
        } catch (error) {
            next(error);
        }
    };

export const markNotificationRead =
    async (
        req,
        res,
        next
    ) => {
        try {
            const notification =
                await Notification.findOneAndUpdate(
                    {
                        _id:
                            req.params.id,
                        recipient:
                            req.user._id
                    },
                    {
                        read: true
                    },
                    {
                        new: true
                    }
                );

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Notification not found"
                });
            }

            res.json({
                success: true,
                notification
            });
        } catch (error) {
            next(error);
        }
    };

export const markAllNotificationsRead =
    async (
        req,
        res,
        next
    ) => {
        try {
            await Notification.updateMany(
                {
                    recipient:
                        req.user._id,
                    read: false
                },
                {
                    read: true
                }
            );

            res.json({
                success: true,
                message:
                    "All notifications marked as read"
            });
        } catch (error) {
            next(error);
        }
    };