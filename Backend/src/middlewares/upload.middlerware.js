import multer from "multer";
import cloudinary from "../config/cloudinary.js";

// Custom Multer storage engine to preserve full Cloudinary metadata (tags, info, secure_url)
class CloudinaryCustomStorage {
  constructor(opts) {
    this.cloudinary = opts.cloudinary;
    this.params = opts.params || {};
  }

  _handleFile(req, file, cb) {
    const uploadOptions =
      typeof this.params === "function"
        ? this.params(req, file)
        : { ...this.params };

    const uploadStream = this.cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return cb(error);
        }
        cb(null, {
          path: result.secure_url,
          size: result.bytes,
          filename: result.public_id,
          tags: result.tags || [],
          info: result.info,
          ...result,
        });
      }
    );

    file.stream.pipe(uploadStream);
  }

  _removeFile(req, file, cb) {
    this.cloudinary.uploader.destroy(file.filename || file.public_id, cb);
  }
}

const storage = new CloudinaryCustomStorage({
  cloudinary,
  params: {
    folder: "socialimage",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    categorization: "google_tagging",
    auto_tagging: 0.7,
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default upload;
