import { useEffect, useState } from "react";
import axios from "axios";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts/getallpost`);
        setPosts(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-white p-6">
      {/* We wrap everything in a Theme to control the colors globally */}
      <SkeletonTheme baseColor="#ebebeb" highlightColor="#f5f5f5">
        <div className="columns-2 md:columns-4 lg:columns-6 gap-6 space-y-6">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <PostSkeleton key={i} />)
            : posts.map((post) => <PostCard key={post._id} post={post} />)
          }
        </div>
      </SkeletonTheme>
    </div>
  );
};

// --- Updated Skeleton using the Library ---
const PostSkeleton = () => {
  return (
    <div className="break-inside-avoid mb-6">
      {/* Matches your image rounded corners */}
      <Skeleton height={250} borderRadius="1rem" />
      <div className="mt-3 px-1">
        {/* Two lines for the caption */}
        <Skeleton count={1} width="90%" />
        <Skeleton count={1} width="60%" />
      </div>
    </div>
  );
};

const PostCard = ({ post }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="break-inside-avoid rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition mb-6">
      <img src={post.image} alt="post" className="w-full object-cover rounded-2xl" />
      {post.caption && (
        <div className="p-3">
          <p onClick={() => setExpanded(!expanded)} className={`text-sm text-gray-700 ${expanded ? "" : "line-clamp-2"}`}>
            {post.caption}
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;