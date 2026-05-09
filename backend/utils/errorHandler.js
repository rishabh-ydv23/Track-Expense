// Custom error class for API errors
export class APIError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

// Error handler middleware (Express requires arity 4 to register as error MW)
export const errorHandler = (err, req, res, next) => {
    const nodeEnv = process.env.NODE_ENV || 'development';

    if (res.headersSent) {
        return next(err);
    }

    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || 'Internal server error';
    let isOperational = Boolean(err.isOperational);

    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid resource id';
        isOperational = true;
    }
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Invalid or expired token';
        isOperational = true;
    }

    if (nodeEnv === 'development') {
        console.error('Error:', {
            status: statusCode,
            message: err.message,
            stack: err.stack
        });
    } else if (isOperational) {
        console.error('API Error:', err.message);
    } else {
        console.error('Unhandled Error:', err.message);
    }

    res.status(statusCode).json({
        success: false,
        message: nodeEnv === 'production' && !isOperational
            ? 'Internal server error'
            : message
    });
};
