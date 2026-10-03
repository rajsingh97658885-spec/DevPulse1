import Blog from "../models/Blog.js";
import User from "../models/User.js";

// ==========================================
// CREATE SLUG
// ==========================================

const createSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
};

// ==========================================
// GET ALL BLOGS
// GET /api/blogs
// ==========================================

export const getBlogs = async (req, res, next) => {
    try {
        const {
            search,
            category,
            tag,
            author,
            contentType,
            page = 1,
            limit = 10,
        } = req.query;

        const filter = {
            published: true,
        };

        if (category) {
            filter.category = category;
        }

        if (tag) {
            filter.tags = tag.toLowerCase();
        }

        if (author) {
            filter.author = author;
        }

        if (contentType) {
            filter.contentType = contentType;
        }

        if (search) {
            filter.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    content: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    excerpt: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    tags: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        const pageNumber = Math.max(
            Number(page) || 1,
            1
        );

        const limitNumber = Math.min(
            Math.max(Number(limit) || 10, 1),
            50
        );

        const skip =
            (pageNumber - 1) * limitNumber;

        const [blogs, total] = await Promise.all([
            Blog.find(filter)
                .populate(
                    "author",
                    "name username avatar"
                )
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limitNumber),

            Blog.countDocuments(filter),
        ]);

        res.json({
            success: true,
            blogs,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                pages: Math.ceil(
                    total / limitNumber
                ),
            },
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// GET BLOG BY ID
// GET /api/blogs/:id
// ==========================================

export const getBlogById = async (
    req,
    res,
    next
) => {
    try {
        const blog = await Blog.findById(
            req.params.id
        ).populate(
            "author",
            "name username avatar bio"
        );

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        blog.views = (blog.views || 0) + 1;

        await blog.save();

        res.json({
            success: true,
            blog,
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// CREATE BLOG
// POST /api/blogs
// ==========================================

export const createBlog = async (
    req,
    res,
    next
) => {
    try {
        const {
            title,
            excerpt = "",
            content = "",
            contentType = "article",
            videoUrl = "",
            thumbnail = "",
            duration = "",
            coverImage = "",
            category,
            tags = [],
            published = true,
        } = req.body;

        // ==========================================
        // NORMALIZE CONTENT TYPE
        // ==========================================

        const normalizedType =
            contentType === "text"
                ? "article"
                : contentType;

        // ==========================================
        // TITLE
        // ==========================================

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Blog title is required",
            });
        }

        // ==========================================
        // CATEGORY
        // ==========================================

        if (!category || !category.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category is required",
            });
        }

        // ==========================================
        // VIDEO VALIDATION
        // ==========================================

        if (normalizedType === "video") {
            if (!videoUrl || !videoUrl.trim()) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Video URL is required",
                });
            }
        }

        // ==========================================
        // ARTICLE VALIDATION
        // ==========================================

        if (normalizedType === "article") {
            if (!content || !content.trim()) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Blog content is required",
                });
            }
        }

        // ==========================================
        // SLUG
        // ==========================================

        const baseSlug = createSlug(title);

        const slug = `${baseSlug}-${Date.now()}`;

        // ==========================================
        // CREATE BLOG
        // ==========================================

        const blog = await Blog.create({
            title: title.trim(),

            slug,

            excerpt: excerpt.trim(),

            content:
                normalizedType === "article"
                    ? content.trim()
                    : "",

            contentType: normalizedType,

            videoUrl:
                normalizedType === "video"
                    ? videoUrl.trim()
                    : "",

            thumbnail:
                normalizedType === "video"
                    ? thumbnail.trim()
                    : "",

            duration:
                normalizedType === "video"
                    ? duration.trim()
                    : "",

            coverImage: coverImage.trim(),

            category: category.trim(),

            tags: Array.isArray(tags)
                ? tags
                    .map((tag) =>
                        String(tag)
                            .trim()
                            .toLowerCase()
                    )
                    .filter(Boolean)
                : [],

            published:
                published !== false,

            author: req.user._id,
        });

        // ==========================================
        // POPULATE AUTHOR
        // ==========================================

        const populatedBlog =
            await blog.populate(
                "author",
                "name username avatar"
            );

        return res.status(201).json({
            success: true,
            message:
                "Blog created successfully",
            blog: populatedBlog,
        });
    } catch (error) {
        console.error(
            "CREATE BLOG ERROR:",
            error
        );

        next(error);
    }
};

// ==========================================
// UPDATE BLOG
// PUT /api/blogs/:id
// ==========================================

export const updateBlog = async (
    req,
    res,
    next
) => {
    try {
        const blog = await Blog.findById(
            req.params.id
        );

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        // ==========================================
        // PERMISSION
        // ==========================================

        const isOwner =
            blog.author.toString() ===
            req.user._id.toString();

        const isAdmin =
            req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message:
                    "You cannot edit this blog",
            });
        }

        // ==========================================
        // CONTENT TYPE
        // ==========================================

        if (req.body.contentType !== undefined) {
            blog.contentType =
                req.body.contentType === "text"
                    ? "article"
                    : req.body.contentType;
        }

        // ==========================================
        // BASIC FIELDS
        // ==========================================

        if (req.body.title !== undefined) {
            if (!req.body.title.trim()) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Blog title is required",
                });
            }

            blog.title =
                req.body.title.trim();
        }

        if (req.body.excerpt !== undefined) {
            blog.excerpt =
                req.body.excerpt.trim();
        }

        if (req.body.category !== undefined) {
            if (!req.body.category.trim()) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Category is required",
                });
            }

            blog.category =
                req.body.category.trim();
        }

        if (req.body.coverImage !== undefined) {
            blog.coverImage =
                req.body.coverImage.trim();
        }

        // ==========================================
        // TAGS
        // ==========================================

        if (req.body.tags !== undefined) {
            blog.tags = Array.isArray(
                req.body.tags
            )
                ? req.body.tags
                    .map((tag) =>
                        String(tag)
                            .trim()
                            .toLowerCase()
                    )
                    .filter(Boolean)
                : [];
        }

        // ==========================================
        // VIDEO FIELDS
        // ==========================================

        if (req.body.videoUrl !== undefined) {
            blog.videoUrl =
                req.body.videoUrl.trim();
        }

        if (req.body.thumbnail !== undefined) {
            blog.thumbnail =
                req.body.thumbnail.trim();
        }

        if (req.body.duration !== undefined) {
            blog.duration =
                req.body.duration.trim();
        }

        // ==========================================
        // ARTICLE CONTENT
        // ==========================================

        if (req.body.content !== undefined) {
            blog.content =
                req.body.content;
        }

        // ==========================================
        // PUBLISHED
        // ==========================================

        if (req.body.published !== undefined) {
            blog.published =
                req.body.published;
        }

        // ==========================================
        // VALIDATE CONTENT TYPE
        // ==========================================

        if (blog.contentType === "video") {
            if (
                !blog.videoUrl ||
                !blog.videoUrl.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Video URL is required",
                });
            }

            blog.content = "";
        }

        if (blog.contentType === "article") {
            if (
                !blog.content ||
                !blog.content.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Blog content is required",
                });
            }

            blog.videoUrl = "";
            blog.thumbnail = "";
            blog.duration = "";
        }

        await blog.save();

        const updatedBlog =
            await blog.populate(
                "author",
                "name username avatar"
            );

        res.json({
            success: true,
            message:
                "Blog updated successfully",
            blog: updatedBlog,
        });
    } catch (error) {
        console.error(
            "UPDATE BLOG ERROR:",
            error
        );

        next(error);
    }
};

// ==========================================
// DELETE BLOG
// DELETE /api/blogs/:id
// ==========================================

export const deleteBlog = async (
    req,
    res,
    next
) => {
    try {
        const blog = await Blog.findById(
            req.params.id
        );

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        const isOwner =
            blog.author.toString() ===
            req.user._id.toString();

        const isAdmin =
            req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message:
                    "You cannot delete this blog",
            });
        }

        await blog.deleteOne();

        res.json({
            success: true,
            message:
                "Blog deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// LIKE / UNLIKE
// POST /api/blogs/:id/like
// ==========================================

export const likeBlog = async (
    req,
    res,
    next
) => {
    try {
        const blog = await Blog.findById(
            req.params.id
        );

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message:
                    "Please login first",
            });
        }

        if (!Array.isArray(blog.likes)) {
            blog.likes = [];
        }

        const userId = req.user._id;

        const index =
            blog.likes.findIndex(
                (id) =>
                    String(id) ===
                    String(userId)
            );

        let liked;

        if (index !== -1) {
            blog.likes.splice(index, 1);
            liked = false;
        } else {
            blog.likes.push(userId);
            liked = true;
        }

        await blog.save();

        const updatedBlog =
            await Blog.findById(
                blog._id
            ).populate(
                "author",
                "name username avatar"
            );

        res.json({
            success: true,
            liked,
            likesCount:
                blog.likes.length,
            blog: updatedBlog,
        });
    } catch (error) {
        console.error(
            "LIKE ERROR:",
            error
        );

        next(error);
    }
};

// ==========================================
// BOOKMARK
// POST /api/blogs/:id/bookmark
// ==========================================

export const bookmarkBlog = async (
    req,
    res,
    next
) => {
    try {
        const blog = await Blog.findById(
            req.params.id
        );

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        const user = await User.findById(
            req.user._id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found",
            });
        }

        if (!Array.isArray(user.bookmarks)) {
            user.bookmarks = [];
        }

        const alreadyBookmarked =
            user.bookmarks.some(
                (id) =>
                    id.toString() ===
                    blog._id.toString()
            );

        if (alreadyBookmarked) {
            user.bookmarks =
                user.bookmarks.filter(
                    (id) =>
                        id.toString() !==
                        blog._id.toString()
                );
        } else {
            user.bookmarks.push(
                blog._id
            );
        }

        await user.save();

        const updatedBlog =
            await blog.populate(
                "author",
                "name username avatar"
            );

        res.json({
            success: true,
            bookmarked:
                !alreadyBookmarked,
            blog: updatedBlog,
        });
    } catch (error) {
        next(error);
    }
};