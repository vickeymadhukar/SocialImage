import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

const UserBoard = () => {

  const { user, isAuthenticated ,loginWithRedirect ,isLoading} = useAuth0();
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
  if (!isLoading && !isAuthenticated) {
    loginWithRedirect();
  }
}, [isLoading, isAuthenticated, loginWithRedirect]);



  useEffect(() => {
    if(!user) return;
    const fetchMyPosts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/posts/getpostbyid/${user.sub}`
        );
        setPosts(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchMyPosts();
  }, [user]);

if (isLoading) {
  return <div className="p-10 text-center">Loading...</div>;
}


if (!isAuthenticated || !user) {
  return <div className="p-10 text-center">Redirecting...</div>;
}

  return (
    <div className="min-h-screen bg-white">

      <div className="p-6">
        <button onClick={() => navigate(-1)}>
          ←
        </button>
      </div>

      <div className="flex flex-col items-center text-center">

        <img
          src={user.picture}
          alt="profile"
          className="w-32 h-32 rounded-full object-cover"
        />

        <h1 className="text-3xl font-bold mt-4">
          {user.name}
        </h1>

        <p className="text-gray-500 mt-2">
          {user.email}
        </p>

        <p className="mt-2 text-sm">
          0 following
        </p>

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          <button className="bg-gray-200 px-5 py-2 rounded-full">
            Share profile
          </button>

          <button className="bg-gray-200 px-5 py-2 rounded-full">
            Edit profile
          </button>
        </div>

      </div>

   
      {/* User Posts */}
      <div className="p-6 columns-3 md:columns-4 lg:columns-5 gap-6 space-y-6">
        {posts.map((post) => (
          <img
            key={post._id}
            src={`http://localhost:5000/${post.image}`}
            className="rounded-xl break-inside-avoid"
            alt="post"
          />
        ))}
      </div>

    </div>
  );
};

export default UserBoard;