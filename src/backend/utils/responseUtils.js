const sendError = (res, status, message, code = null) => {
    const response = { message };
    if (code) response.code = code;
    if (process.env.NODE_ENV === 'development' && status === 500) {
        response.error = message;
        response.message = 'An internal error occurred';
    }
    res.status(status).json(response);
};

const sendSuccess = (res, data, status = 200) => {
    res.status(status).json(data);
};

const sendValidationError = (res, message) => {
    sendError(res, 400, message, 'VALIDATION_ERROR');
};

const sendAuthError = (res, message = 'Unauthorized') => {
    sendError(res, 401, message, 'AUTH_ERROR');
};

const sendForbiddenError = (res, message = 'Forbidden') => {
    sendError(res, 403, message, 'FORBIDDEN');
};

const sendNotFoundError = (res, message = 'Not found') => {
    sendError(res, 404, message, 'NOT_FOUND');
};

const sendServerError = (res, error) => {
    console.error('Server error:', error);
    sendError(res, 500, 'An error occurred. Please try again later.', 'SERVER_ERROR');
};

module.exports = {
    sendError,
    sendSuccess,
    sendValidationError,
    sendAuthError,
    sendForbiddenError,
    sendNotFoundError,
    sendServerError
};