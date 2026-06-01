import express from "express";
import cors from "cors";
import postRoute from "./routes/post.route.js";
import userRoute from "./routes/user.route.js";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "https://socialimage-1.onrender.com","http://localhost:5000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json());

app.use("/posts", postRoute);
app.use("/users", userRoute);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Global error handling middleware to capture Multer upload errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Image size is too large! Maximum allowed size is 5MB.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }
  
  res.status(500).json({
    success: false,
    message: err.message || "An unexpected error occurred during upload.",
  });
});

app.get("/", (req, res) => {
  console.log("Hello world");
});

export default app;
