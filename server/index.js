/**
 * Vercel Express entry: root index exports the app so the platform routes
 * all HTTP traffic through one Fluid compute function.
 * Local dev: continue using `nodemon server.js` (see package.json).
 */
const { app } = require("./server");

module.exports = app;
