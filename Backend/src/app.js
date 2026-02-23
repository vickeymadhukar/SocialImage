import express from "express";
import cors from "cors";
import postRoute from "./routes/post.route.js";

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
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  console.log("Hello world");
});

export default app;
