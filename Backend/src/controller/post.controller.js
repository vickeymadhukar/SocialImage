import Post from "../models/post.model.js";
import redisClient from "../config/redis.js";

export const createpost = async (req, res) => {
  try {
    const { caption, userId } = req.body;

    if (!req.file || !caption) {
      return res.status(400).json({
        success: false,
        message: "Image and caption are required",
      });
    }

    const newPost = await Post.create({
      image: req.file.path,
      caption,
      userId,
    });

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
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor; // This will be the ID of the last post on the previous page

    let query = {};

    if (cursor) {
      const cursorPost = await Post.findById(cursor);
      if (cursorPost) {
        query = {
          $or: [
            { createdAt: { $lt: cursorPost.createdAt } },
            {
              createdAt: cursorPost.createdAt,
              _id: { $lt: cursorPost._id },
            },
          ],
        };
      }
    }

    // Fetch limit + 1 posts to see if there is a next page
    const allpost = await Post.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1);

    const hasNextPage = allpost.length > limit;

    // If hasNextPage is true, slice off the extra post used for checking
    const data = hasNextPage ? allpost.slice(0, limit) : allpost;

    // The next cursor is the ID of the last post in the active page data
    const nextCursor = hasNextPage && data.length > 0 ? data[data.length - 1]._id : null;

    if (redisClient && redisClient.isOpen) {
      try {
        await redisClient.set("test", "hello redis");
        const value = await redisClient.get("test");
        console.log("Redis Test Value:", value);
      } catch (redisError) {
        console.error("Redis operation failed:", redisError.message);
      }
    }



    res.status(200).json({
      success: true,
      message: "all post get successfully",
      count: data.length,
      data: data,
      nextCursor: nextCursor,
      hasNextPage: hasNextPage,
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

export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id !== userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();

    res.status(200).json({
      success: true,
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likesCount: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling like",
      error: error.message,
    });
  }
};
