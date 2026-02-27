import express from "express";

import upload from "../middlewares/upload.middlerware.js";

import {
  createpost,
  getALLpost,
  deletePost,
  getPostsByUser,
  toggleLike,
} from "../controller/post.controller.js";

const router = express.Router();

router.post("/createpost", upload.single("image"), createpost);
router.get("/getallpost", getALLpost);
router.delete("/deletepost/:id", deletePost);
router.get("/getpostbyid/:userId", getPostsByUser);
router.put("/likes/:postId", toggleLike);
export default router;
