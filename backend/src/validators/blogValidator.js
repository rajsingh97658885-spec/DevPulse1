import {
    body
} from "express-validator";

export const createBlogValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage(
            "Blog title is required"
        )
        .isLength({
            max: 200
        })
        .withMessage(
            "Title cannot exceed 200 characters"
        ),

    body("content")
        .trim()
        .notEmpty()
        .withMessage(
            "Blog content is required"
        ),

    body("category")
        .trim()
        .notEmpty()
        .withMessage(
            "Category is required"
        ),

    body("excerpt")
        .optional()
        .trim()
        .isLength({
            max: 500
        })
        .withMessage(
            "Excerpt cannot exceed 500 characters"
        ),

    body("tags")
        .optional()
        .isArray()
        .withMessage(
            "Tags must be an array"
        )
];

export const updateBlogValidator = [
    body("title")
        .optional()
        .trim()
        .isLength({
            max: 200
        })
        .withMessage(
            "Title cannot exceed 200 characters"
        ),

    body("content")
        .optional()
        .trim()
        .notEmpty()
        .withMessage(
            "Content cannot be empty"
        ),

    body("category")
        .optional()
        .trim()
        .notEmpty()
        .withMessage(
            "Category cannot be empty"
        )
];