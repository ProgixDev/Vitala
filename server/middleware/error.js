const multer = require("multer");

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // Handle Multer errors (file upload issues)
  if (err instanceof multer.MulterError || err.code === "LIMIT_FILE_SIZE") {
    let message = err.message || "File upload error";
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File too large. Maximum allowed size exceeded.";
    }
    error = {
      statusCode: 400,
      message,
    };
  }

  // Common file type validation errors (from our upload middleware)
  if (err.message && err.message.includes("Invalid file type")) {
    error = {
      statusCode: 400,
      message: err.message,
    };
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = {
      statusCode: 404,
      message,
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = {
      statusCode: 400,
      message,
    };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = {
      statusCode: 400,
      message,
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;
