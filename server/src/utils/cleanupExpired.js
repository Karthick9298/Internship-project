const cron = require("node-cron");
const cloudinary = require("../utils/cloudinary");
const File = require("../models/File");
const DownloadLog = require("../models/DownloadLog");

/**
 * Runs every hour. Finds all expired files, deletes them from
 * Cloudinary, removes their download logs, then removes the DB record.
 */
const startCleanupJob = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("🧹 Running expired file cleanup...");

    try {
      const now = new Date();
      const expiredFiles = await File.find({
        expiresAt: { $lte: now },
        isActive: true,
      });

      if (expiredFiles.length === 0) {
        console.log("✅ No expired files found.");
        return;
      }

      for (const file of expiredFiles) {
        try {
          // Delete from Cloudinary using stored publicId
          if (file.publicId) {
            await cloudinary.uploader.destroy(file.publicId, {
              resource_type: "raw",
            });
          }

          // Remove associated download logs
          await DownloadLog.deleteMany({ fileId: file._id });

          // Mark as inactive (soft delete) or hard delete
          await File.findByIdAndDelete(file._id);

          console.log(
            `🗑️  Deleted expired file: ${file.originalName} (${file.shareCode})`
          );
        } catch (err) {
          console.error(
            `❌ Failed to clean up file ${file.shareCode}:`,
            err.message
          );
        }
      }

      console.log(`✅ Cleanup complete. Removed ${expiredFiles.length} file(s).`);
    } catch (err) {
      console.error("❌ Cleanup job error:", err.message);
    }
  });

  console.log("⏰ Expired file cleanup job scheduled (every hour).");
};

module.exports = startCleanupJob;
