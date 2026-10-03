import express from "express";

import {
    getComments,
    createComment,
    deleteComment
} from "../controllers/commentController.js";

import {
    protect
} from "../middleware/authMiddleware.js";

import {
    validate
} from "../middleware/validateMiddleware.js";

import {
    commentValidator
} from "../validators/commentValidator.js";

const router =
    express.Router();

router.get(
    "/blogs/:blogId/comments",
    getComments
);

router.post(
    "/blogs/:blogId/comments",
    protect,
    commentValidator,
    validate,
    createComment
);

router.delete(
    "/comments/:id",
    protect,
    deleteComment
);

export default router;