import express from "express";
import { syncUser, updateProfile } from "../controller/user.controller.js";
import profileupload from "../middlewares/profile.middleware.js";

const router = express.Router();

router.post("/sync", syncUser);
router.patch("/profile", profileupload.single("profileImage"), updateProfile);
router.patch("/profile/:userId", profileupload.single("profileImage"), updateProfile);

export default router;
