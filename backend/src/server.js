import "./config/env.js";

import app from "./app.js";

import connectDB
    from "./config/db.js";

const PORT =
    process.env.PORT || 5000;

const startServer =
    async () => {
        try {
            await connectDB();

            app.listen(
                PORT,
                () => {
                    console.log(
                        "================================="
                    );

                    console.log(
                        "       DevPulse Backend"
                    );

                    console.log(
                        "================================="
                    );

                    console.log(
                        `Server: http://localhost:${PORT}`
                    );

                    console.log(
                        `API: http://localhost:${PORT}/api`
                    );

                    console.log(
                        `Health: http://localhost:${PORT}/api/health`
                    );

                    console.log(
                        "================================="
                    );
                }
            );
        } catch (error) {
            console.error(
                "Failed to start server:",
                error.message
            );

            process.exit(1);
        }
    };

startServer();