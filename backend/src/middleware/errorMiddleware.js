export const errorMiddleware = (
    error,
    req,
    res,
    next
) => {
    console.error(
        "SERVER ERROR:",
        error
    );

    if (
        error.name ===
        "ValidationError"
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Validation error",
            errors: Object.values(
                error.errors
            ).map(
                (item) => item.message
            )
        });
    }

    if (
        error.code === 11000
    ) {
        return res.status(409).json({
            success: false,
            message:
                "Duplicate value already exists"
        });
    }

    res.status(
        error.statusCode || 500
    ).json({
        success: false,
        message:
            error.message ||
            "Internal server error"
    });
};