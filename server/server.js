require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const compression = require("compression");
const morgan = require("morgan");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

const isVercel = !!process.env.VERCEL;

const app = express();

// Disable ETag generation to avoid Express returning 304 Not Modified
// for API responses when clients send conditional requests (If-None-Match).
app.set("etag", false);

let server;
let io;

if (isVercel) {
  // Socket.IO requires a long-lived HTTP server; not supported on Vercel serverless.
  io = {
    on: () => {},
    to: () => ({ emit: () => {} }),
    emit: () => {},
  };
} else {
  server = http.createServer(app);
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || [
        "http://localhost:8081",
        "http://192.168.1.165:8081",
        "exp://192.168.1.165:8081",
      ],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    socket.on("updateLocation", (data) => {
      const { appointmentId, location } = data;
      io.to(`appointment_${appointmentId}`).emit("locationUpdate", location);
    });

    socket.on("joinAppointment", (appointmentId) => {
      socket.join(`appointment_${appointmentId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

// Liveness (no DB) — useful for Vercel / load balancers
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    environment: process.env.NODE_ENV,
    vercel: isVercel,
  });
});

// Ensure DB is ready before route handlers (important for serverless cold starts)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection failed:", err);
    const code =
      err.code === "MONGODB_URI_MISSING" || err.message === "MONGODB_URI is not defined"
        ? "MONGODB_URI_MISSING"
        : "MONGODB_CONNECTION_FAILED";
    const payload = {
      success: false,
      message: "Database unavailable",
      code,
    };
    if (process.env.NODE_ENV === "development") {
      payload.detail = err.message;
    }
    res.status(503).json(payload);
  }
});

// Body parser middleware
// Skip JSON parsing for Stripe webhook route (needs raw body for signature verification)
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payments/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());

// CORS
const vercelOrigin = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : null;

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:8081",
        "http://192.168.1.165:8081",
        "exp://192.168.1.165:8081",
        process.env.FRONTEND_URL,
        vercelOrigin,
      ].filter(Boolean);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (
        origin.includes("192.168.1.") ||
        origin.includes("localhost") ||
        origin.includes("exp://") ||
        origin.includes(".vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Static files (ephemeral on Vercel; prefer Cloudinary for persistence)
app.use("/uploads", express.static("uploads"));

app.set("io", io);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/geocoding", require("./routes/geocoding"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/emergency-contacts", require("./routes/emergencyContacts"));
app.use("/api/emergency", require("./routes/emergency"));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

if (!isVercel && server) {
  server.listen(PORT, HOST, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on ${HOST}:${PORT}`,
    );
  });

  process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

module.exports = { app, io };
