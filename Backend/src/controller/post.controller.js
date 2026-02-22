import Post from "../models/post.model.js";

export const createpost = async (req, res) => {
  try {
    const { caption, userId } = req.body;
    const image = req.file ? req.file.path : null;

    if (!image || !caption) {
      return res.status(400).json({
        success: false,
        message: "Image and caption are required",
      });
    }

    const newPost = await Post.create({ image, caption, userId });
    res.status(201).json({
      success: true,
      data: newPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "error occurr in post file in somewhere creating post",
      error: error.message,
    });
  }
};

export const getALLpost = async (req, res) => {
  try {
    const allpost = await Post.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "all post get successfully",
      count: allpost.length,
      data: allpost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "error occurr in getting all post",
      error: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: "post not found with this id",
      });
    }

    res.status(200).json({
      success: true,
      message: "post deleted successfully",
      data: deletedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "error occurr in deleting post",
      error: error.message,
    });
  }
};

export const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user posts",
      error: error.message,
    });
  }
};
