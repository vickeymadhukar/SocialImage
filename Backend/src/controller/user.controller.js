import User from "../models/user.model.js";

// Sync user from Auth0 on mount
export const syncUser = async (req, res) => {
  try {
    const { userId, name, email, profileImage } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId (Auth0 sub) is required",
      });
    }

    let user = await User.findOne({ userId });

    if (!user) {
      user = await User.create({
        userId,
        name: name || "User",
        email: email || "",
        profileImage: profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
      });
      console.log(`Successfully synced and created new user ${name || userId} in MongoDB.`);
    }

    res.status(200).json({
      success: true,
      message: "User profile synced successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error syncing user profile",
      error: error.message,
    });
  }
};

// PATCH: Update user profile details separately/individually
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params; // Support passing userId in route path, e.g. PATCH /users/profile/:userId
    const { name, email, bio, dob } = req.body;
    const targetUserId = userId || req.body.userId; // Fallback to body.userId if not in route param

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "userId is required to update profile",
      });
    }

    let user = await User.findOne({ userId: targetUserId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found in MongoDB",
      });
    }

    // PATCH behavior: only update fields that are explicitly sent in the request
    if (name !== undefined) {
      user.name = name;
    }
    
    if (email !== undefined) {
      user.email = email;
    }

    if (bio !== undefined) {
      user.bio = bio;
    }

    if (dob !== undefined) {
      // Sanitize dob input to avoid BSON casting errors
      if (dob && dob !== "null" && dob !== "undefined" && dob !== "") {
        const parsedDate = new Date(dob);
        if (!isNaN(parsedDate.getTime())) {
          user.dob = parsedDate;
        } else {
          user.dob = null;
        }
      } else {
        user.dob = null;
      }
    }

    // Update profile image if a file was uploaded to Cloudinary
    if (req.file) {
      user.profileImage = req.file.path;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user profile",
      error: error.message,
    });
  }
};