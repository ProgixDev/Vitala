const mongoose = require("mongoose");

/** Reuse connection across Vercel/serverless invocations */
let cached = global.__vitalaMongoose;
if (!cached) {
  cached = global.__vitalaMongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (!process.env.MONGODB_URI || !String(process.env.MONGODB_URI).trim()) {
    const err = new Error("MONGODB_URI is not defined");
    err.code = "MONGODB_URI_MISSING";
    throw err;
  }

  // Drop stale handles after cold sleep or network blips (common on serverless).
  if (cached.conn && cached.conn.connection?.readyState !== 1) {
    cached.conn = null;
    cached.promise = null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 20_000,
      socketTimeoutMS: 45_000,
      // Prefer IPv4; some serverless runtimes have flaky IPv6 to Atlas.
      family: 4,
    };
    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    if (process.env.NODE_ENV === "development") {
      console.log(`MongoDB Connected: ${cached.conn.connection.host}`);
    }
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    console.error(`MongoDB connection error: ${error.message}`);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
