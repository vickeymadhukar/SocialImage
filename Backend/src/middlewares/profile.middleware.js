import multer from "multer";
import cloudinaryStorage from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const { CloudinaryStorage } = cloudinaryStorage;

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const profileupload = multer({ storage,
    limits: {
    fileSize: 5 * 1024 * 1024, 
  },
 });

export default profileupload;