const bcrypt = require("bcrypt");
const File = require("../models/File");
const DownloadLog = require("../models/DownloadLog");
const cloudinary = require("../utils/cloudinary");
const generateCode = require("../utils/generateCode");
const { validationResult } = require("express-validator");

// Helper: parse expiry option to Date
const parseExpiry = (option) => {
  const now = new Date();
  const map = {
    "1h": 1 * 60 * 60 * 1000,
    "6h": 6 * 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
  };
  const ms = map[option];
  if (!ms) return null;
  return new Date(now.getTime() + ms);
};

// POST /api/files/upload
const uploadFile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // If validation fails after upload, clean up Cloudinary
    if (req.file?.public_id) {
      await cloudinary.uploader.destroy(req.file.public_id, {
        resource_type: "raw",
      });
    }
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const { expiry = "24h", maxDownloads, password } = req.body;

  const expiresAt = parseExpiry(expiry);
  if (!expiresAt) {
    return res.status(400).json({ message: "Invalid expiry option." });
  }

  try {
    const shareCode = await generateCode();

    let passwordHash = null;
    if (password && password.trim()) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const file = await File.create({
      ownerId: req.user ? req.user._id : null,
      originalName: req.file.originalname,
      storageUrl: req.file.path, // Cloudinary URL
      publicId: req.file.filename, // Cloudinary public_id
      mimeType: req.file.mimetype,
      size: req.file.size,
      shareCode,
      passwordHash,
      expiresAt,
      maxDownloads: maxDownloads ? parseInt(maxDownloads) : null,
      downloadCount: 0,
      isActive: true,
    });

    res.status(201).json({
      message: "File uploaded successfully.",
      shareCode: file.shareCode,
      originalName: file.originalName,
      size: file.size,
      mimeType: file.mimeType,
      expiresAt: file.expiresAt,
      maxDownloads: file.maxDownloads,
      isPasswordProtected: !!file.passwordHash,
      shareUrl: `${process.env.CLIENT_URL}/share/${file.shareCode}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error during upload." });
  }
};

// GET /api/files/my-files  (auth required)
const getMyFiles = async (req, res) => {
  try {
    const files = await File.find({ ownerId: req.user._id })
      .sort({ createdAt: -1 })
      .select("-passwordHash -publicId");

    res.json({ files });
  } catch (error) {
    console.error("My files error:", error);
    res.status(500).json({ message: "Server error fetching files." });
  }
};

// GET /api/files/stats  (auth required)
const getStats = async (req, res) => {
  try {
    const files = await File.find({ ownerId: req.user._id });

    const totalFiles = files.length;
    const totalDownloads = files.reduce((sum, f) => sum + f.downloadCount, 0);
    const totalStorage = files.reduce((sum, f) => sum + f.size, 0);
    const activeShares = files.filter(
      (f) => f.isActive && new Date(f.expiresAt) > new Date()
    ).length;

    res.json({
      totalFiles,
      totalDownloads,
      totalStorage, // bytes — format on frontend
      activeShares,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ message: "Server error fetching stats." });
  }
};

// DELETE /api/files/:id  (auth required, owner only)
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    if (file.ownerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this file." });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(file.publicId, { resource_type: "raw" });

    // Remove download logs
    await DownloadLog.deleteMany({ fileId: file._id });

    // Remove from DB
    await File.findByIdAndDelete(file._id);

    res.json({ message: "File deleted successfully." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server error deleting file." });
  }
};

// PATCH /api/files/:id/toggle  (auth required, owner only)
const toggleSharing = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    if (file.ownerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }

    file.isActive = !file.isActive;
    await file.save();

    res.json({
      message: `Sharing ${file.isActive ? "enabled" : "disabled"}.`,
      isActive: file.isActive,
    });
  } catch (error) {
    console.error("Toggle error:", error);
    res.status(500).json({ message: "Server error toggling sharing." });
  }
};

module.exports = { uploadFile, getMyFiles, getStats, deleteFile, toggleSharing };
