import express from "express";

import {
    getBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    likeBlog,
    bookmarkBlog,
} from "../controllers/blogController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// GET ALL BLOGS
// GET /api/blogs
// ==========================================

router.get("/", getBlogs);

// ==========================================
// GET SINGLE BLOG
// GET /api/blogs/:id
// ==========================================

router.get("/:id", getBlogById);

// ==========================================
// CREATE BLOG
// POST /api/blogs
// ==========================================

router.post(
    "/",
    protect,
    createBlog
);

// ==========================================
// UPDATE BLOG
// PUT /api/blogs/:id
// ==========================================

router.put(
    "/:id",
    protect,
    updateBlog
);

// ==========================================
// DELETE BLOG
// DELETE /api/blogs/:id
// ==========================================

router.delete(
    "/:id",
    protect,
    deleteBlog
);

// ==========================================
// LIKE / UNLIKE
// POST /api/blogs/:id/like
// ==========================================

router.post(
    "/:id/like",
    protect,
    likeBlog
);

// ==========================================
// BOOKMARK
// POST /api/blogs/:id/bookmark
// ==========================================

router.post(
    "/:id/bookmark",
    protect,
    bookmarkBlog
);

export default router;