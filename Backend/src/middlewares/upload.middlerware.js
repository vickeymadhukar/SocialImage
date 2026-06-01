import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "socialimage",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    categorization: "google_tagging",   // ← add this
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
