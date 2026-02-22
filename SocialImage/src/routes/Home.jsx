import { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/posts/getallpost");
        setPosts(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-white p-6">

      <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">

        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}

      </div>

    </div>
  );
};

export default Home;



/* Separate Post Card Component */
const PostCard = ({ post }) => {

  const [expanded, setExpanded] = useState(false);

  return (
    <div className="break-inside-avoid rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">

      <img
        src={`http://localhost:5000/${post.image}`}
        alt="post"
        className="w-full object-cover rounded-2xl"
      />

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

          {post.caption.length > 80 && (
            <span
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-600 cursor-pointer"
            >
              {expanded ? "Show less" : "Read more"}
            </span>
          )}
        </div>
      )}

    </div>
  );
};
