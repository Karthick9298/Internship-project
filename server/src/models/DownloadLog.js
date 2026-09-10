const mongoose = require("mongoose");

const downloadLogSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
    required: true,
  },
  ipAddress: {
    type: String,
    default: "unknown",
  },
  userAgent: {
    type: String,
    default: "unknown",
  },
  downloadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for fetching logs per file efficiently
downloadLogSchema.index({ fileId: 1, downloadedAt: -1 });

module.exports = mongoose.model("DownloadLog", downloadLogSchema);
