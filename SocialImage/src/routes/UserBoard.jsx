import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

const UserBoard = () => {
  const { user, isAuthenticated, loginWithRedirect, isLoading } = useAuth0();
  const [posts, setPosts] = useState([]);
  const [dbUser, setDbUser] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  const handledelete = async (postId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/posts/deletepost/${postId}`);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      setOpenMenuId(null);
    } catch (err) {
      console.log(err);
    }
  };

  // Load from localStorage cache immediately when user is authenticated/available
  useEffect(() => {
    if (!user) return;
    const cached = localStorage.getItem(`socialimage_user_profile_${user.sub}`);
    if (cached) {
      setDbUser(JSON.parse(cached));
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchBoardData = async () => {
      try {
        // Sync and fetch profile details from MongoDB
        const profileRes = await axios.post(`${import.meta.env.VITE_API_URL}/users/sync`, {
          userId: user.sub,
          name: user.name,
          email: user.email,
          profileImage: user.picture,
        });
        if (profileRes.data.success) {
          const u = profileRes.data.data;
          setDbUser(u);
          localStorage.setItem(`socialimage_user_profile_${user.sub}`, JSON.stringify(u));
        }

        // Fetch user posts
        const postsRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/posts/getpostbyid/${user.sub}`
        );
        setPosts(postsRes.data.data);
      } catch (err) {
        console.error("Error fetching user board data:", err);
      }
    };

    fetchBoardData();
  }, [user]);

  if (isLoading) {
    return <div className="p-10 text-center font-semibold text-slate-600">Loading profile...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div className="p-10 text-center font-semibold text-slate-600">Redirecting to login...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-700 hover:text-slate-900 font-medium text-lg hover:scale-105 active:scale-95 transition"
        >
          ← Back
        </button>
      </div>

      <div className="flex flex-col items-center text-center max-w-lg mx-auto px-4">
        <img
          src={dbUser?.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop"}
          alt="profile"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop";
          }}
          className="w-32 h-32 rounded-full object-cover border border-slate-100 shadow-sm"
        />

        <h1 className="text-3xl font-bold mt-4 text-slate-800">
          {dbUser?.name || user.name}
        </h1>

        <p className="text-slate-500 mt-1 font-medium">
          {dbUser?.email || user.email}
        </p>

        {dbUser?.age !== null && dbUser?.age !== undefined && dbUser?.dob && (
          <p className="text-slate-400 text-xs font-semibold mt-1.5">
            Age: {dbUser.age} years old • Born {new Date(dbUser.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}

        {dbUser?.bio && (
          <p className="text-slate-600 text-sm max-w-sm mt-3 px-4 italic leading-relaxed">
            "{dbUser.bio}"
          </p>
        )}

        <p className="mt-4 text-xs font-medium text-slate-400">
          0 following
        </p>

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          <button className="bg-gray-100 text-slate-700 font-semibold px-5 py-2 rounded-full text-xs hover:bg-gray-200 transition duration-150">
            Share profile
          </button>

          <button
            onClick={() => navigate("/setting")}
            className="bg-slate-900 text-white font-bold px-5 py-2 rounded-full text-xs hover:bg-slate-800 transition duration-150"
          >
            Edit profile
          </button>
        </div>
      </div>

      {/* User Posts */}
      <div className="p-6 mt-10">
        <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">My Publications</h3>
        {posts.length === 0 ? (
          <div className="text-center p-12 text-slate-400 text-sm font-medium">
            No posts created yet.
          </div>
        ) : (
          <div className="columns-3 md:columns-4 lg:columns-5 gap-6 space-y-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="relative break-inside-avoid rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition duration-200"
              >
                {/* Image */}
                <img
                  src={post.image}
                  alt="post"
                  className="w-full rounded-xl"
                  loading="lazy"
                />

                {/* 3 Dots Button */}
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === post._id ? null : post._id)
                  }
                  className="absolute top-3 right-3 bg-black/60 text-white 
                             w-8 h-8 rounded-full flex items-center 
                             justify-center text-lg opacity-0 
                             group-hover:opacity-100 transition duration-200"
                >
                  ⋮
                </button>

                {/* Dropdown */}
                {openMenuId === post._id && (
                  <div className="absolute top-12 right-3 bg-white shadow-lg rounded-lg py-2 w-28 z-50 border border-slate-100 animate-fade-in">
                    <button
                      onClick={() => handledelete(post._id)}
                      className="block w-full text-left px-4 py-2 
                                 text-red-600 hover:bg-rose-50 text-xs font-semibold transition"
                    >
                      Delete Post
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBoard;