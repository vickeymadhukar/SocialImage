import { useEffect, useState,useRef } from "react";
import axios from "axios";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth0 } from "@auth0/auth0-react";

 
const Home = () => {
 

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();

  const[page , setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);


const observer = useRef(); 
  // Fetch All Posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if(page==1)setLoading(true);
        else setLoadingMore(true);

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/posts/getallpost?page=${page}&limit=10`
        );

         if (page === 1) {
             setPosts(res.data.data);
                } else {
                      setPosts((prev) => [...prev, ...res.data.data]);
                          }
        
          if (page >= res.data.totalPages) {
        setHasMore(false);
      }



      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchPosts();
  }, [page]);

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

     setPosts((prevPosts) =>
      prevPosts.map((post) =>
      post._id === postId
      ? {
          ...post,
          likes: Array(res.data.likesCount).fill("temp")
        }
      : post
  )
);
    } catch (error) {
      console.log(error);
    }
  };


const lastPostRef =(node)=>{
  if(loadingMore) return;
  if(observer.current) observer.current.disconnect();

   observer.current = new IntersectionObserver((entries)=>{
    if(entries[0].isIntersecting && hasMore){
      setPage((prev)=>prev+1);
    }
   });
 if (node) observer.current.observe(node);
}




  return (
    <div className="min-h-screen bg-white p-6">
      <SkeletonTheme baseColor="#ebebeb" highlightColor="#f5f5f5">
        <div className="columns-2 md:columns-4 lg:columns-6 gap-6 space-y-6">
          
          {/* Initial Loading */}
          {loading &&
            Array.from({ length: 12 }).map((_, i) => (
              <PostSkeleton key={i} />
            ))}

          {/* Posts */}
          {!loading &&
            posts.map((post, index) => {
              if (index === posts.length - 1) {
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

        {/* Loading More */}
        {loadingMore && (
          <div className="text-center mt-6">Loading more...</div>
        )}
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