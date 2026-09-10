const express = require("express");
const { body } = require("express-validator");
const {
  uploadFile,
  getMyFiles,
  getStats,
  deleteFile,
  toggleSharing,
} = require("../controllers/fileController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { uploadLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

// Upload — guests or logged-in users
router.post(
  "/upload",
  uploadLimiter,
  optionalAuth,
  upload.single("file"),
  [
    body("expiry")
      .optional()
      .isIn(["1h", "6h", "24h", "7d"])
      .withMessage("Invalid expiry option. Must be 1h, 6h, 24h, or 7d."),
    body("maxDownloads")
      .optional()
      .isInt({ min: 1, max: 10000 })
      .withMessage("Max downloads must be between 1 and 10000."),
    body("password")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Password must be at most 100 characters."),
  ],
  uploadFile
);

// Dashboard routes (auth required)
router.get("/my-files", protect, getMyFiles);
router.get("/stats", protect, getStats);
router.delete("/:id", protect, deleteFile);
router.patch("/:id/toggle", protect, toggleSharing);

module.exports = router;
