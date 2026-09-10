const express = require("express");
const {
  getFileByCode,
  verifyPassword,
  downloadFile,
  getQRCode,
} = require("../controllers/shareController");
const {
  shareLookupLimiter,
  passwordVerifyLimiter,
} = require("../middleware/rateLimitMiddleware");

const router = express.Router();

// Verify password for a protected file
router.post("/verify", passwordVerifyLimiter, verifyPassword);

// Get file metadata by share code
router.get("/:code", shareLookupLimiter, getFileByCode);

// Download file — password passed as query param (?password=xxx)
router.get("/:code/download", shareLookupLimiter, downloadFile);

// Get QR code for share link
router.get("/:code/qr", getQRCode);

module.exports = router;
