/**
 * Vercel serverless entry: all HTTP routes are handled by the Express app.
 * Set Project Root to `server` in Vercel, or place this project as the server folder root.
 */
const { app } = require("../server");

module.exports = app;
