import dotenv from "dotenv";

dotenv.config();

const requiredEnvironmentVariables = [
    "MONGO_URI",
    "JWT_SECRET"
];

for (const variable of requiredEnvironmentVariables) {
    if (!process.env[variable]) {
        console.error(
            `Missing environment variable: ${variable}`
        );

        process.exit(1);
    }
}

export default {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN:
        process.env.JWT_EXPIRES_IN || "7d",
    CLIENT_URL:
        process.env.CLIENT_URL ||
        "http://localhost:5173"
};