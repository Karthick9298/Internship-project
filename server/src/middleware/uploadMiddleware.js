const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const MAX_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || "50");
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Archives
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "application/x-tar",
  "application/gzip",
  // Text
  "text/plain",
  "text/csv",
  "text/html",
  "application/json",
  // Video
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/x-msvideo",
  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  // Code
  "application/javascript",
  "text/css",
  "text/x-python",
];

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "codeshare",
    resource_type: "raw", // supports all file types
    public_id: `codeshare_${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`,
    // Don't transform files — store as-is
    use_filename: true,
    unique_filename: true,
  }),
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type "${file.mimetype}" is not allowed. Supported types: images, PDFs, documents, archives, text, video, audio.`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter,
});

module.exports = upload;
