import ApiError from '../utils/apiError.js';

export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    console.error(err);

    if (err.name === 'CastError') {
        const message = `Resource not found`;
        error = new ApiError(404, message);
    }

    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new ApiError(409, message);
    }

    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new ApiError(400, message);
    }

    if (err.name === 'JsonWebTokenError') {
        const message = 'Token is invalid';
        error = new ApiError(401, message);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token has expired';
        error = new ApiError(401, message);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error'
    });
};
