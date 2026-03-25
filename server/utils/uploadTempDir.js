const fs = require("fs");
const path = require("path");
const os = require("os");

function getUploadTempDir() {
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), "vitala-uploads");
  }
  return path.join(__dirname, "..", "uploads", "temp");
}

/** Writable on Vercel only under os.tmpdir(); local dev uses uploads/temp. */
function ensureUploadTempDir() {
  const dir = getUploadTempDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

module.exports = { getUploadTempDir, ensureUploadTempDir };
