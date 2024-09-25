export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'An unexpected error occurred';
    res.status(statusCode).json({
        success: false,
        status: 'error',
        statusCode,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
export default errorHandler;
//# sourceMappingURL=errorHandler.js.map