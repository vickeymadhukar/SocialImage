import { useEffect, useState } from "react";
import axios from "axios";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth0 } from "@auth0/auth0-react";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();

  // Fetch All Posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/posts/getallpost`
        );
        setPosts(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Like / Unlike Handler
  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/posts/likes/${postId}`,
        { userId: user.sub }
      );

      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: res.data.isLiked
                  ? [...post.likes, user.sub]
                  : post.likes.filter((id) => id !== user.sub),
              }
            : post
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <SkeletonTheme baseColor="#ebebeb" highlightColor="#f5f5f5">
        <div className="columns-2 md:columns-4 lg:columns-6 gap-6 space-y-6">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <PostSkeleton key={i} />
              ))
            : posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  handleLike={handleLike}
                  currentUser={user}
                />
              ))}
        </div>
      </SkeletonTheme>
    </div>
  );
};



// Skeleton Component
const PostSkeleton = () => {
  return (
    <div className="break-inside-avoid mb-6">
      <Skeleton height={250} borderRadius="1rem" />
      <div className="mt-3 px-1">
        <Skeleton width="90%" />
        <Skeleton width="60%" />
      </div>
    </div>
  );
};



// Post Card Component
const PostCard = ({ post, handleLike, currentUser }) => {
  const [expanded, setExpanded] = useState(false);

  const isLiked = post.likes?.includes(currentUser?.sub);

  return (
    <div className="break-inside-avoid rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition mb-6">
      
      {/* Image */}
      <img
        src={post.image}
        alt="post"
        className="w-full object-cover rounded-2xl"
        loading="lazy"
      />

      {/* Caption */}
      {post.caption && (
        <div className="p-3">
          <p
            onClick={() => setExpanded(!expanded)}
            className={`text-sm text-gray-700 cursor-pointer ${
              expanded ? "" : "line-clamp-2"
            }`}
          >
            {post.caption}
          </p>
        </div>
      )}

      {/* Like Section */}
      <div className="flex items-center gap-2 px-3 pb-3">
        <button
          onClick={() => handleLike(post._id)}
          className={`text-xl transition ${
            isLiked ? "text-red-500" : "text-gray-400"
          }`}
        >
          {isLiked ? "❤️" : "🤍"}
        </button>

        <span className="text-sm text-gray-600">
          {post.likes?.length || 0}
        </span>
      </div>

    </div>
  );
};

export default Home;