import User from "../models/User.js";

import generateToken
    from "../utils/generateToken.js";

import {
    hashPassword,
    comparePassword
} from "../utils/hashPassword.js";

export const register =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                name,
                username,
                email,
                password
            } = req.body;

            const normalizedEmail =
                email.toLowerCase();

            const normalizedUsername =
                username.toLowerCase();

            const existingUser =
                await User.findOne({
                    $or: [
                        {
                            email:
                                normalizedEmail
                        },
                        {
                            username:
                                normalizedUsername
                        }
                    ]
                });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Email or username already exists"
                });
            }

            const hashedPassword =
                await hashPassword(
                    password
                );

            const user =
                await User.create({
                    name,
                    username:
                        normalizedUsername,
                    email:
                        normalizedEmail,
                    password:
                        hashedPassword
                });

            const token =
                generateToken(user._id);

            return res.status(201).json({
                success: true,
                message:
                    "Registration successful",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    username:
                        user.username,
                    email: user.email,
                    role: user.role,
                    avatar:
                        user.avatar,
                    bio: user.bio
                }
            });
        } catch (error) {
            next(error);
        }
    };

export const login =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                email,
                password
            } = req.body;

            const user =
                await User.findOne({
                    email:
                        email.toLowerCase()
                }).select(
                    "+password"
                );

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid email or password"
                });
            }

            const validPassword =
                await comparePassword(
                    password,
                    user.password
                );

            if (!validPassword) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid email or password"
                });
            }

            const token =
                generateToken(user._id);

            return res.json({
                success: true,
                message:
                    "Login successful",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    username:
                        user.username,
                    email: user.email,
                    role: user.role,
                    avatar:
                        user.avatar,
                    bio: user.bio
                }
            });
        } catch (error) {
            next(error);
        }
    };

export const getMe =
    async (
        req,
        res
    ) => {
        res.json({
            success: true,
            user: req.user
        });
    };