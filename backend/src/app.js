import express from "express";
import cors from "cors";

import authRoutes
    from "./routes/authRoutes.js";

import blogRoutes
    from "./routes/blogRoutes.js";

import commentRoutes
    from "./routes/commentRoutes.js";

import userRoutes
    from "./routes/userRoutes.js";

import notificationRoutes
    from "./routes/notificationRoutes.js";

import {
    errorMiddleware
} from "./middleware/errorMiddleware.js";

const app =
    express();

app.use(
    cors({
        origin:
            process.env.CLIENT_URL ||
            "http://localhost:5173",
        credentials: true
    })
);

app.use(
    express.json({
        limit: "2mb"
    })
);

app.use(
    express.urlencoded({
        extended: true
    })
);

app.get(
    "/",
    (req, res) => {
        res.json({
            success: true,
            message:
                "Welcome to DevPulse API"
        });
    }
);

app.get(
    "/api/health",
    (req, res) => {
        res.json({
            success: true,
            message:
                "DevPulse API is running",
            timestamp:
                new Date().toISOString()
        });
    }
);

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/blogs",
    blogRoutes
);

app.use(
    "/api",
    commentRoutes
);

app.use(
    "/api/users",
    userRoutes
);

app.use(
    "/api/notifications",
    notificationRoutes
);

app.use(
    (req, res) => {
        res.status(404).json({
            success: false,
            message:
                `Route not found: ${req.method} ${req.originalUrl}`
        });
    }
);

app.use(
    errorMiddleware
);

export default app;