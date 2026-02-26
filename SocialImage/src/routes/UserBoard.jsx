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

const [openMenuId, setOpenMenuId] = useState(null);

   const handledelete = async (postId)=>{
     try{
      await axios.delete(`${import.meta.env.VITE_API_URL}/posts/deletepost/${postId}`);

      setPosts((prev)=>prev.filter((post)=>post._id!==postId));
      setOpenMenuId(null);
     }catch(err){
      console.log(err);
     }
   }
  


  useEffect(() => {
    if(!user) return;
    const fetchMyPosts = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/posts/getpostbyid/${user.sub}`
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
    <div
      key={post._id}
      className="relative break-inside-avoid rounded-xl overflow-hidden group"
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
                   group-hover:opacity-100 transition"
      >
        ⋮
      </button>

      {/* Dropdown */}
      {openMenuId === post._id && (
        <div className="absolute top-12 right-3 bg-white shadow-lg rounded-lg py-2 w-28 z-50">
          <button
            onClick={() => handledelete(post._id)}
            className="block w-full text-left px-4 py-2 
                       text-red-600 hover:bg-gray-100"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  ))}
</div>

    </div>
  );
};

export default UserBoard;