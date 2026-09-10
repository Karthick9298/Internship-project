const bcrypt = require("bcrypt");
const QRCode = require("qrcode");
const File = require("../models/File");
const DownloadLog = require("../models/DownloadLog");

// Helper: check if file is accessible
const checkFileAccess = (file) => {
  if (!file || !file.isActive) return { ok: false, reason: "not_found" };
  if (new Date() > new Date(file.expiresAt)) return { ok: false, reason: "expired" };
  if (file.maxDownloads !== null && file.downloadCount >= file.maxDownloads)
    return { ok: false, reason: "limit_exceeded" };
  return { ok: true };
};

// GET /api/share/:code
// Returns file metadata (NOT the download URL)
const getFileByCode = async (req, res) => {
  const { code } = req.params;

  try {
    const file = await File.findOne({ shareCode: code.toUpperCase() }).select(
      "-passwordHash -publicId -storageUrl"
    );

    if (!file) {
      return res.status(404).json({ message: "No file found with this code." });
    }

    const access = checkFileAccess(file);
    if (!access.ok) {
      const messages = {
        expired: "This file has expired and is no longer available.",
        limit_exceeded: "Download limit for this file has been reached.",
        not_found: "No file found with this code.",
      };
      return res.status(410).json({ message: messages[access.reason], reason: access.reason });
    }

    res.json({
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      shareCode: file.shareCode,
      expiresAt: file.expiresAt,
      maxDownloads: file.maxDownloads,
      downloadCount: file.downloadCount,
      isPasswordProtected: !!file.passwordHash,
      createdAt: file.createdAt,
    });
  } catch (error) {
    console.error("Share lookup error:", error);
    res.status(500).json({ message: "Server error looking up file." });
  }
};

// POST /api/share/verify
// Verifies a password-protected file's password
const verifyPassword = async (req, res) => {
  const { code, password } = req.body;

  if (!code || !password) {
    return res.status(400).json({ message: "Code and password are required." });
  }

  try {
    const file = await File.findOne({ shareCode: code.toUpperCase() });

    if (!file) {
      return res.status(404).json({ message: "No file found with this code." });
    }

    const access = checkFileAccess(file);
    if (!access.ok) {
      return res.status(410).json({ message: "File is no longer available." });
    }

    if (!file.passwordHash) {
      // No password needed — just allow
      return res.json({ verified: true });
    }

    const isMatch = await bcrypt.compare(password, file.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password.", verified: false });
    }

    res.json({ verified: true });
  } catch (error) {
    console.error("Password verify error:", error);
    res.status(500).json({ message: "Server error verifying password." });
  }
};

// GET /api/share/:code/download
// Validates access, logs download, returns Cloudinary URL
const downloadFile = async (req, res) => {
  const { code } = req.params;
  const { password } = req.query;

  try {
    const file = await File.findOne({ shareCode: code.toUpperCase() });

    if (!file) {
      return res.status(404).json({ message: "No file found with this code." });
    }

    const access = checkFileAccess(file);
    if (!access.ok) {
      const messages = {
        expired: "This file has expired.",
        limit_exceeded: "Download limit has been reached.",
        not_found: "File not found.",
      };
      return res.status(410).json({ message: messages[access.reason] });
    }

    // Check password if protected
    if (file.passwordHash) {
      if (!password) {
        return res.status(401).json({ message: "Password required to download." });
      }
      const isMatch = await bcrypt.compare(password, file.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password." });
      }
    }

    // Increment download count
    file.downloadCount += 1;
    await file.save();

    // Log the download
    await DownloadLog.create({
      fileId: file._id,
      ipAddress:
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
    });

    // Return the Cloudinary URL for the frontend to trigger download
    res.json({
      downloadUrl: file.storageUrl,
      originalName: file.originalName,
      mimeType: file.mimeType,
    });
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Server error during download." });
  }
};

// GET /api/share/:code/qr
// Returns a QR code PNG (base64 data URL) for the share link
const getQRCode = async (req, res) => {
  const { code } = req.params;
  const shareUrl = `${process.env.CLIENT_URL}/share/${code.toUpperCase()}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(shareUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#1e1b4b", light: "#ffffff" },
    });

    res.json({ qrCode: qrDataUrl, shareUrl });
  } catch (error) {
    console.error("QR error:", error);
    res.status(500).json({ message: "Failed to generate QR code." });
  }
};

module.exports = { getFileByCode, verifyPassword, downloadFile, getQRCode };
