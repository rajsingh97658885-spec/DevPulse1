import {
    body
} from "express-validator";

export const registerValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage(
            "Name is required"
        )
        .isLength({
            min: 2,
            max: 50
        })
        .withMessage(
            "Name must be 2-50 characters"
        ),

    body("username")
        .trim()
        .notEmpty()
        .withMessage(
            "Username is required"
        )
        .isLength({
            min: 3,
            max: 30
        })
        .withMessage(
            "Username must be 3-30 characters"
        )
        .matches(
            /^[a-zA-Z0-9_]+$/
        )
        .withMessage(
            "Username can only contain letters, numbers and underscores"
        ),

    body("email")
        .trim()
        .isEmail()
        .withMessage(
            "Valid email is required"
        )
        .normalizeEmail(),

    body("password")
        .isLength({
            min: 6
        })
        .withMessage(
            "Password must contain at least 6 characters"
        )
];

export const loginValidator = [
    body("email")
        .trim()
        .isEmail()
        .withMessage(
            "Valid email is required"
        )
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage(
            "Password is required"
        )
];