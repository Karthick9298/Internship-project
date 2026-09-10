const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null = guest upload
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    storageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true, // Cloudinary public_id for deletion
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true, // in bytes
    },
    shareCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      length: 6,
    },
    passwordHash: {
      type: String,
      default: null, // null = no password protection
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    maxDownloads: {
      type: Number,
      default: null, // null = unlimited
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true, // owner can disable sharing
    },
  },
  { timestamps: true }
);

// Index for owner queries
fileSchema.index({ ownerId: 1, createdAt: -1 });
// TTL-style index support (cleanup is manual via cron)
fileSchema.index({ expiresAt: 1 });

module.exports = mongoose.model("File", fileSchema);
