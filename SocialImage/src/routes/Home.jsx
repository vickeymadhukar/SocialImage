import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth0 } from "@auth0/auth0-react";
import useDebounce from "../hooks/useDebounce";
import SearchBar from "../Components/SearchBar";


const Home = () => {

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();

  const [cursor, setCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Search state
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const debouncedQuery = useDebounce(query, 300);

  const observer = useRef();
  // Fetch All Posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!cursor) setLoading(true);
        else setLoadingMore(true);

        const url = cursor
          ? `${import.meta.env.VITE_API_URL}/posts/getallpost?cursor=${cursor}&limit=10`
          : `${import.meta.env.VITE_API_URL}/posts/getallpost?limit=10`;

        const res = await axios.get(url);

        if (!cursor) {
          setPosts(res.data.data);
        } else {
          setPosts((prev) => [...prev, ...res.data.data]);
        }

        setNextCursor(res.data.nextCursor);
        setHasMore(res.data.hasNextPage);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchPosts();
  }, [cursor]);

  // Like / Unlike Handler
  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }

    const userId = user?.sub;
    if (!userId) return;

    const originalPost = posts.find((p) => p._id === postId);
    if (!originalPost) return;

    const wasLiked = originalPost.likes?.includes(userId);

    // Calculate optimistic likes array
    const optimisticLikes = wasLiked
      ? (originalPost.likes || []).filter((id) => id !== userId)
      : [...(originalPost.likes || []), userId];

    // 1. Update UI optimistically
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? { ...post, likes: optimisticLikes }
          : post
      )
    );

    try {
      // 2. Perform background request
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/posts/likes/${postId}`,
        { userId }
      );

      // 3. Update state with actual likes array from backend
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, likes: res.data.likes }
            : post
        )
      );
    } catch (error) {
      console.error("Like toggle failed:", error);
      // 4. Revert to original state on failure
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, likes: originalPost.likes }
            : post
        )
      );
    }
  };


  const lastPostRef = (node) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && nextCursor) {
        setCursor(nextCursor);
      }
    });
    if (node) observer.current.observe(node);
  }

  // Filter posts client-side based on search query + category
  const isSearching = debouncedQuery.trim() !== "" || selectedCategory !== "All";
  const filteredPosts = isSearching
    ? posts.filter((post) => {
        const q = debouncedQuery.trim().toLowerCase();
        const matchesQuery =
          !q ||
          post.caption?.toLowerCase().includes(q) ||
          post.tags?.some((t) => t.toLowerCase().includes(q));
        const matchesCategory =
          selectedCategory === "All" ||
          post.category === selectedCategory ||
          post.tags?.some(
            (t) => t.toLowerCase() === selectedCategory.toLowerCase()
          );
        return matchesQuery && matchesCategory;
      })
    : posts;

  return (
    <div className="min-h-screen bg-white">
      {/* Search bar sticky at top */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <SearchBar
          value={query}
          onChange={setQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      <div className="p-6">
        <SkeletonTheme baseColor="#ebebeb" highlightColor="#f5f5f5">
          <div className="columns-2 md:columns-4 lg:columns-6 gap-6 space-y-6">

            {/* Initial Loading */}
            {loading &&
              Array.from({ length: 12 }).map((_, i) => (
                <PostSkeleton key={i} />
              ))}

            {/* Posts */}
            {!loading &&
              filteredPosts.map((post, index) => {
                // Only attach infinite scroll sentinel when NOT filtering
                if (!isSearching && index === filteredPosts.length - 1) {
                  return (
                    <div ref={lastPostRef} key={post._id}>
                      <PostCard
                        post={post}
                        handleLike={handleLike}
                        currentUser={user}
                      />
                    </div>
                  );
                }

                return (
                  <PostCard
                    key={post._id}
                    post={post}
                    handleLike={handleLike}
                    currentUser={user}
                  />
                );
              })}
          </div>

          {/* No search results */}
          {!loading && isSearching && filteredPosts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-5xl mb-4">🔍</span>
              <h3 className="text-lg font-semibold text-gray-800">No results found</h3>
              <p className="text-sm text-gray-400 mt-1">
                Try a different keyword or category
              </p>
            </div>
          )}

          {/* Loading More */}
          {loadingMore && (
            <div className="text-center mt-6 text-sm text-gray-400">Loading more...</div>
          )}
        </SkeletonTheme>
      </div>
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
            className={`text-sm text-gray-700 cursor-pointer ${expanded ? "" : "line-clamp-2"
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
          className={`text-xl transition ${isLiked ? "text-red-500" : "text-gray-400"
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