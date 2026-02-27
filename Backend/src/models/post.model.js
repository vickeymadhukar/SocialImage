import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, "Image URL is required"],
    },
    caption: {
      type: String,
      required: [true, "Caption is required"],
      trim: true,
      maxlength: [300, "Caption cannot exceed 200 characters"],
    },
    likes: {
      type: String,
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
  },
  {
    timestamps: true,
  },
);

const Post = mongoose.model("Post", postSchema);

export default Post;
