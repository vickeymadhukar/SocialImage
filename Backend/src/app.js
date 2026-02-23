import express from "express";
import cors from "cors";
import postRoute from "./routes/post.route.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "https://socialimage-1.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json());

app.use("/posts", postRoute);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  console.log("Hello world");
});

export default app;
