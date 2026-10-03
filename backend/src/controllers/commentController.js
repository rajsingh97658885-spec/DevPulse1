import Comment from "../models/Comment.js";
import Blog from "../models/Blog.js";
import Notification from "../models/Notification.js";

export const getComments =
    async (
        req,
        res,
        next
    ) => {
        try {
            const comments =
                await Comment.find({
                    blog:
                        req.params.blogId
                })
                    .populate(
                        "author",
                        "name username avatar"
                    )
                    .sort({
                        createdAt: 1
                    });

            res.json({
                success: true,
                comments
            });
        } catch (error) {
            next(error);
        }
    };

export const createComment =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                content,
                parentComment =
                null
            } = req.body;

            const blog =
                await Blog.findById(
                    req.params.blogId
                );

            if (!blog) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Blog not found"
                });
            }

            if (parentComment) {
                const parent =
                    await Comment.findById(
                        parentComment
                    );

                if (
                    !parent ||
                    parent.blog.toString() !==
                    blog._id.toString()
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Invalid parent comment"
                    });
                }
            }

            const comment =
                await Comment.create({
                    blog:
                        blog._id,
                    author:
                        req.user._id,
                    content,
                    parentComment
                });

            const populatedComment =
                await comment.populate(
                    "author",
                    "name username avatar"
                );

            if (
                blog.author.toString() !==
                req.user._id.toString()
            ) {
                await Notification.create({
                    recipient:
                        blog.author,
                    sender:
                        req.user._id,
                    type: parentComment
                        ? "reply"
                        : "comment",
                    message:
                        parentComment
                            ? `${req.user.name} replied to a comment on your blog`
                            : `${req.user.name} commented on your blog`,
                    blog:
                        blog._id
                });
            }

            res.status(201).json({
                success: true,
                message:
                    "Comment added successfully",
                comment:
                    populatedComment
            });
        } catch (error) {
            next(error);
        }
    };

export const deleteComment =
    async (
        req,
        res,
        next
    ) => {
        try {
            const comment =
                await Comment.findById(
                    req.params.id
                );

            if (!comment) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Comment not found"
                });
            }

            const blog =
                await Blog.findById(
                    comment.blog
                );

            const isOwner =
                comment.author.toString() ===
                req.user._id.toString();

            const isAdmin =
                req.user.role ===
                "admin";

            const isBlogOwner =
                blog &&
                blog.author.toString() ===
                req.user._id.toString();

            if (
                !isOwner &&
                !isAdmin &&
                !isBlogOwner
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You cannot delete this comment"
                });
            }

            await comment.deleteOne();

            res.json({
                success: true,
                message:
                    "Comment deleted successfully"
            });
        } catch (error) {
            next(error);
        }
    };