import express from "express";

import {
    getProfile,
    getUserById,
    updateProfile,
    getUserBlogs,
    getPublicUserBlogs,
    getBookmarks,
    followUser,
    getFollowers,
    getFollowing,
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// MY PROFILE
// ==========================================

router.get(
    "/profile",
    protect,
    getProfile
);

router.put(
    "/profile",
    protect,
    updateProfile
);

// ==========================================
// MY BLOGS
// ==========================================

router.get(
    "/blogs",
    protect,
    getUserBlogs
);

// ==========================================
// MY BOOKMARKS
// ==========================================

router.get(
    "/bookmarks",
    protect,
    getBookmarks
);

// ==========================================
// PUBLIC USER BLOGS
// IMPORTANT: BEFORE /:id
// ==========================================

router.get(
    "/:id/blogs",
    getPublicUserBlogs
);

// ==========================================
// PUBLIC USER PROFILE
// IMPORTANT: BEFORE FOLLOW ROUTES
// ==========================================

router.get(
    "/:id",
    getUserById
);

// ==========================================
// FOLLOW / UNFOLLOW
// ==========================================

router.post(
    "/:id/follow",
    protect,
    followUser
);

// ==========================================
// FOLLOWERS
// ==========================================

router.get(
    "/:id/followers",
    getFollowers
);

// ==========================================
// FOLLOWING
// ==========================================

router.get(
    "/:id/following",
    getFollowing
);

export default router;