const mongoose = require("mongoose");

/** Reuse connection across Vercel/serverless invocations */
let cached = global.__vitalaMongoose;
if (!cached) {
  cached = global.__vitalaMongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
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
    console.error(`MongoDB connection error: ${error.message}`);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
