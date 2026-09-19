const multer = require("multer");

// Store file in memory as a buffer — we stream it straight to Cloudinary,
// so we never save raw files on our own server (important for Vercel's
// serverless/read-only filesystem anyway).
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
});

module.exports = upload;
