import express from "express";

import {
    register,
    login,
    getMe
} from "../controllers/authController.js";

import {
    protect
} from "../middleware/authMiddleware.js";

import {
    validate
} from "../middleware/validateMiddleware.js";

import {
    registerValidator,
    loginValidator
} from "../validators/authValidator.js";

const router =
    express.Router();

router.post(
    "/register",
    registerValidator,
    validate,
    register
);

router.post(
    "/login",
    loginValidator,
    validate,
    login
);

router.get(
    "/me",
    protect,
    getMe
);

export default router;