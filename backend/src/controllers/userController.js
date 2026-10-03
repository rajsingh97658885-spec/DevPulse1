import User from "../models/User.js";
import Blog from "../models/Blog.js";
import Notification from "../models/Notification.js";

// =====================================================
// GET MY PROFILE
// GET /api/users/profile
// =====================================================

export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password")
            .populate(
                "followers",
                "name username avatar bio"
            )
            .populate(
                "following",
                "name username avatar bio"
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const blogsCount = await Blog.countDocuments({
            author: user._id,
        });

        res.json({
            success: true,

            user,

            followersCount:
                user.followers?.length || 0,

            followingCount:
                user.following?.length || 0,

            blogsCount,
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// GET PUBLIC USER PROFILE
// GET /api/users/:id
// =====================================================

export const getUserById = async (
    req,
    res,
    next
) => {
    try {
        const user = await User.findById(
            req.params.id
        )
            .select(
                "-password -email -bookmarks"
            )
            .populate(
                "followers",
                "name username avatar bio"
            )
            .populate(
                "following",
                "name username avatar bio"
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const blogs = await Blog.find({
            author: user._id,
            published: true,
        })
            .populate(
                "author",
                "name username avatar"
            )
            .sort({
                createdAt: -1,
            });

        res.json({
            success: true,

            user: {
                _id: user._id,
                id: user._id,

                name: user.name,
                username: user.username,
                avatar: user.avatar,
                bio: user.bio,

                followers:
                    user.followers || [],

                following:
                    user.following || [],

                followersCount:
                    user.followers?.length || 0,

                followingCount:
                    user.following?.length || 0,

                blogsCount: blogs.length,

                blogs,
            },
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// UPDATE PROFILE
// PUT /api/users/profile
// =====================================================

export const updateProfile = async (
    req,
    res,
    next
) => {
    try {
        const {
            name,
            username,
            bio,
            avatar,
        } = req.body;

        const user = await User.findById(
            req.user._id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (name !== undefined) {
            user.name = name;
        }

        if (bio !== undefined) {
            user.bio = bio;
        }

        if (avatar !== undefined) {
            user.avatar = avatar;
        }

        if (
            username &&
            username.toLowerCase() !==
            user.username
        ) {
            const normalizedUsername =
                username.toLowerCase();

            const existing =
                await User.findOne({
                    username:
                        normalizedUsername,

                    _id: {
                        $ne: user._id,
                    },
                });

            if (existing) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Username already exists",
                });
            }

            user.username =
                normalizedUsername;
        }

        await user.save();

        const updatedUser =
            await User.findById(
                user._id
            )
                .select("-password")
                .populate(
                    "followers",
                    "name username avatar bio"
                )
                .populate(
                    "following",
                    "name username avatar bio"
                );

        res.json({
            success: true,

            message:
                "Profile updated successfully",

            user: {
                id: updatedUser._id,
                _id: updatedUser._id,

                name: updatedUser.name,
                username:
                    updatedUser.username,

                email: updatedUser.email,

                avatar:
                    updatedUser.avatar,

                bio: updatedUser.bio,

                role: updatedUser.role,

                followers:
                    updatedUser.followers || [],

                following:
                    updatedUser.following || [],

                followersCount:
                    updatedUser.followers
                        ?.length || 0,

                followingCount:
                    updatedUser.following
                        ?.length || 0,
            },
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// GET MY BLOGS
// GET /api/users/blogs
// =====================================================

export const getUserBlogs = async (
    req,
    res,
    next
) => {
    try {
        const blogs = await Blog.find({
            author: req.user._id,
        })
            .populate(
                "author",
                "name username avatar"
            )
            .sort({
                createdAt: -1,
            });

        res.json({
            success: true,
            blogs,
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// GET PUBLIC USER BLOGS
// GET /api/users/:id/blogs
// =====================================================

export const getPublicUserBlogs = async (
    req,
    res,
    next
) => {
    try {
        const targetUser =
            await User.findById(
                req.params.id
            );

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const blogs = await Blog.find({
            author: targetUser._id,
            published: true,
        })
            .populate(
                "author",
                "name username avatar"
            )
            .sort({
                createdAt: -1,
            });

        res.json({
            success: true,
            blogs,
            count: blogs.length,
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// GET BOOKMARKS
// GET /api/users/bookmarks
// =====================================================

export const getBookmarks = async (
    req,
    res,
    next
) => {
    try {
        const user =
            await User.findById(
                req.user._id
            ).populate({
                path: "bookmarks",

                populate: {
                    path: "author",
                    select:
                        "name username avatar",
                },
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,

            bookmarks:
                user.bookmarks || [],
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// FOLLOW / UNFOLLOW
// POST /api/users/:id/follow
// =====================================================

export const followUser = async (
    req,
    res,
    next
) => {
    try {
        const targetUserId =
            req.params.id;

        const currentUserId =
            req.user._id;

        // Cannot follow yourself
        if (
            String(targetUserId) ===
            String(currentUserId)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot follow yourself",
            });
        }

        const targetUser =
            await User.findById(
                targetUserId
            );

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found",
            });
        }

        const currentUser =
            await User.findById(
                currentUserId
            );

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message:
                    "Current user not found",
            });
        }

        // Make sure arrays exist
        if (
            !Array.isArray(
                currentUser.following
            )
        ) {
            currentUser.following = [];
        }

        if (
            !Array.isArray(
                targetUser.followers
            )
        ) {
            targetUser.followers = [];
        }

        const alreadyFollowing =
            currentUser.following.some(
                (id) =>
                    String(id) ===
                    String(targetUserId)
            );

        // =================================================
        // UNFOLLOW
        // =================================================

        if (alreadyFollowing) {
            currentUser.following =
                currentUser.following.filter(
                    (id) =>
                        String(id) !==
                        String(targetUserId)
                );

            targetUser.followers =
                targetUser.followers.filter(
                    (id) =>
                        String(id) !==
                        String(currentUserId)
                );

            await currentUser.save();
            await targetUser.save();

            return res.json({
                success: true,

                following: false,

                followersCount:
                    targetUser.followers
                        .length,

                followingCount:
                    currentUser.following
                        .length,

                message:
                    "User unfollowed successfully",
            });
        }

        // =================================================
        // FOLLOW
        // =================================================

        currentUser.following.push(
            targetUser._id
        );

        targetUser.followers.push(
            currentUser._id
        );

        await currentUser.save();
        await targetUser.save();

        // =================================================
        // NOTIFICATION
        // =================================================

        try {
            await Notification.create({
                recipient:
                    targetUser._id,

                sender:
                    currentUser._id,

                type: "follow",

                message:
                    `${currentUser.name} started following you`,
            });
        } catch (notificationError) {
            console.error(
                "Follow notification error:",
                notificationError
            );
        }

        return res.json({
            success: true,

            following: true,

            followersCount:
                targetUser.followers.length,

            followingCount:
                currentUser.following.length,

            message:
                "User followed successfully",
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// GET FOLLOWERS
// GET /api/users/:id/followers
// =====================================================

export const getFollowers = async (
    req,
    res,
    next
) => {
    try {
        const user =
            await User.findById(
                req.params.id
            ).populate(
                "followers",
                "name username avatar bio"
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found",
            });
        }

        res.json({
            success: true,

            followers:
                user.followers || [],

            count:
                user.followers?.length ||
                0,
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// GET FOLLOWING
// GET /api/users/:id/following
// =====================================================

export const getFollowing = async (
    req,
    res,
    next
) => {
    try {
        const user =
            await User.findById(
                req.params.id
            ).populate(
                "following",
                "name username avatar bio"
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found",
            });
        }

        res.json({
            success: true,

            following:
                user.following || [],

            count:
                user.following?.length ||
                0,
        });
    } catch (error) {
        next(error);
    }
};