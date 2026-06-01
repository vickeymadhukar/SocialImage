import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth0 } from "@auth0/auth0-react";
import SearchBar from "../Components/SearchBar";

// Debounce helper — waits until user stops typing before firing
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const Search = () => {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false); // tracks if a search was attempted

  const debouncedQuery = useDebounce(query, 400);

  // Fetch whenever debounced query or category changes
  useEffect(() => {
    const isBlank = debouncedQuery.trim() === "" && selectedCategory === "All";
    if (isBlank) {
      setPosts([]);
      setSearched(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setSearched(true);
      try {
        const params = new URLSearchParams();
        if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
        if (selectedCategory !== "All") params.set("category", selectedCategory);

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/posts/search?${params.toString()}`
        );
        setPosts(res.data.data || []);
      } catch (err) {
        console.error("Search failed:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, selectedCategory]);

  // Like handler (same pattern as Home)
  const handleLike = async (postId) => {
    if (!isAuthenticated) { loginWithRedirect(); return; }
    const userId = user?.sub;
    if (!userId) return;

    const original = posts.find((p) => p._id === postId);
    if (!original) return;

    const wasLiked = original.likes?.includes(userId);
    const optimistic = wasLiked
      ? (original.likes || []).filter((id) => id !== userId)
      : [...(original.likes || []), userId];

    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, likes: optimistic } : p))
    );

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/posts/likes/${postId}`,
        { userId }
      );
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes: res.data.likes } : p))
      );
    } catch {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes: original.likes } : p))
      );
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 pt-6 pb-28">

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Search</h1>
        <SearchBar
          value={query}
          onChange={setQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Results */}
      <SkeletonTheme baseColor="#ebebeb" highlightColor="#f5f5f5">
        {/* Loading skeletons */}
        {loading && (
          <div className="columns-2 md:columns-4 lg:columns-5 gap-4 space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-4">
                <Skeleton height={200 + (i % 3) * 60} borderRadius="1rem" />
              </div>
            ))}
          </div>
        )}

        {/* Results grid */}
        {!loading && posts.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mb-4 text-center">
              {posts.length} result{posts.length !== 1 ? "s" : ""}
            </p>
            <div className="columns-2 md:columns-4 lg:columns-5 gap-4 space-y-4">
              {posts.map((post) => (
                <SearchPostCard
                  key={post._id}
                  post={post}
                  handleLike={handleLike}
                  currentUser={user}
                />
              ))}
            </div>
          </>
        )}

        {/* Empty state after search */}
        {!loading && searched && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">🔍</span>
            <h3 className="text-lg font-semibold text-gray-800">No results found</h3>
            <p className="text-sm text-gray-400 mt-1">
              Try a different keyword or category
            </p>
          </div>
        )}

        {/* Initial empty state */}
        {!loading && !searched && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">✨</span>
            <h3 className="text-lg font-semibold text-gray-800">Discover something new</h3>
            <p className="text-sm text-gray-400 mt-1">
              Search by keyword or pick a category above
            </p>
          </div>
        )}
      </SkeletonTheme>
    </div>
  );
};

// Post card for search results
const SearchPostCard = ({ post, handleLike, currentUser }) => {
  const [expanded, setExpanded] = useState(false);
  const isLiked = post.likes?.includes(currentUser?.sub);

  return (
    <div className="break-inside-avoid rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition mb-4">
      <img
        src={post.image}
        alt={post.caption}
        className="w-full object-cover rounded-2xl"
        loading="lazy"
      />

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 pt-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {post.caption && (
        <div className="px-3 pt-1 pb-1">
          <p
            onClick={() => setExpanded(!expanded)}
            className={`text-sm text-gray-700 cursor-pointer ${expanded ? "" : "line-clamp-2"}`}
          >
            {post.caption}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 px-3 pb-3">
        <button
          onClick={() => handleLike(post._id)}
          className={`text-xl transition ${isLiked ? "text-red-500" : "text-gray-400"}`}
        >
          {isLiked ? "❤️" : "🤍"}
        </button>
        <span className="text-sm text-gray-600">{post.likes?.length || 0}</span>
      </div>
    </div>
  );
};

export default Search;
