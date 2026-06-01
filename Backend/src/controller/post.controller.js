import Post from "../models/post.model.js";
import redisClient, { clearPostsCache } from "../config/redis.js";

export const createpost = async (req, res) => {
  try {
    const { caption, userId } = req.body;

    if (!req.file || !caption) {
      return res.status(400).json({
        success: false,
        message: "Image and caption are required",
      });
    }

    // Extract AI tags and category from Cloudinary response
    const tags = req.file.tags || [];
    const category =
      req.file.info?.categorization?.google_tagging?.data?.[0]?.tag ||
      "General";

    console.log("Cloudinary tags →", tags);
    console.log("Cloudinary category →", category);

    const newPost = await Post.create({
      image: req.file.path,
      caption,
      userId,
      tags,
      category,
    });

    clearPostsCache();

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

export const searchPosts = async (req, res) => {
  try {
    const { q, category } = req.query;
    let query = {};

    if (q) {
      query.$text = { $search: q };
    }

    if (category && category !== "All") {
      query.category = category;
    }

    const posts = await Post.find(query)
      .sort(q ? { score: { $meta: "textScore" } } : { createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching posts",
      error: error.message,
    });
  }
};

export const getALLpost = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor;

    const cacheKey = `posts:page:limit:${limit}:cursor:${cursor || "start"}`;

    if (redisClient && redisClient.isOpen) {
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          console.log(`Serving posts from Redis cache for key: ${cacheKey}`);
          return res.status(200).json(JSON.parse(cachedData));
        }
      } catch (redisError) {
        console.error("Redis read failed:", redisError.message);
      }
    }

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

    const allpost = await Post.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1);

    const hasNextPage = allpost.length > limit;
    const data = hasNextPage ? allpost.slice(0, limit) : allpost;
    const nextCursor =
      hasNextPage && data.length > 0 ? data[data.length - 1]._id : null;

    const responseData = {
      success: true,
      message: "all post get successfully",
      count: data.length,
      data: data,
      nextCursor: nextCursor,
      hasNextPage: hasNextPage,
    };

    if (redisClient && redisClient.isOpen) {
      try {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));
        console.log(`Cached posts in Redis for key: ${cacheKey}`);
      } catch (redisError) {
        console.error("Redis write failed:", redisError.message);
      }
    }

    res.status(200).json(responseData);
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

    clearPostsCache();

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
    const updateQuery = alreadyLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    const updatedPost = await Post.findByIdAndUpdate(postId, updateQuery, {
      new: true,
    });

    clearPostsCache();

    res.status(200).json({
      success: true,
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likes: updatedPost.likes,
      likesCount: updatedPost.likes.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling like",
      error: error.message,
    });
  }
};