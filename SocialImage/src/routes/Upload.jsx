import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

export default function Upload() {
  const { isAuthenticated, user ,loginWithRedirect,isLoading} = useAuth0();
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");



  useEffect(()=>{

    if (!isAuthenticated && !isLoading || !user) {
      loginWithRedirect();
    }
  },[isLoading ,isAuthenticated,user,loginWithRedirect])
  
if (isLoading || !isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!isAuthenticated){
      alert("Please login to upload a post");
      return;
    }



    if (!image || !caption) {
      alert("Please select image and add description");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("caption", caption);
    formData.append("userId", user.sub);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/createpost`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Post uploaded successfully!");

      setImage(null);
      setCaption("");

    } catch (err) {
      console.log(err);
      alert("Upload failed");
    }
  };

 

  return (
    <div className="min-h-screen bg-white p-8">

      {/* TOP HEADER BAR */}
      <div className="flex justify-between items-center mb-8">

        <h1 className="text-2xl font-semibold">
           {user.name}
       </h1>

        <div className="flex items-center gap-6">
          <span className="text-gray-500 text-sm">
            Changes stored!
          </span>

          <button
            onClick={handleSubmit}
            className="bg-red-600 text-white px-6 py-3 
                       rounded-full font-semibold 
                       hover:bg-red-700 transition"
          >
            Publish
          </button>
        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="grid md:grid-cols-2 md:gap-22 gap-15">

        {/* LEFT SIDE - Upload Box */}
        <div className="bg-gray-200 rounded-3xl p-6 shadow-sm">

          <div
            className="border-2 border-dashed border-white-300 
                       rounded-3xl h-[400px] flex flex-col 
                       items-center justify-center text-center 
                       cursor-pointer hover:bg-gray-50 transition"
          >
            <input
              type="file"
              className="hidden"
              id="fileUpload"
              onChange={(e) => setImage(e.target.files[0])}
            />

            <label htmlFor="fileUpload" className="cursor-pointer w-full h-full flex items-center justify-center">

              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="h-full w-full object-cover rounded-3xl"
                />
              ) : (
                <div className="flex flex-col items-center gap-4">

                  <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center">
                    ↑
                  </div>

                  <p className="text-lg font-medium">
                    Choose a file or drag and drop it here
                  </p>

                  <p className="text-sm text-gray-500 mt-6">
                    We recommend using high quality .jpg files less
                    than 20 MB or .mp4 files less than 200 MB.
                  </p>

                </div>
              )}

            </label>

          </div>
        </div>

        {/* RIGHT SIDE - Form */}
        <div className="space-y-6">

          <div>
            <label className="block mb-2 text-sm font-medium">
              Title
            </label>
            <input
              type="text"
              placeholder="Add a title"
              className="w-full p-4 rounded-2xl bg-white border border-gray-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Description
            </label>
            <textarea
              rows="4"
              placeholder="Add a detailed description"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white border border-gray-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Board
            </label>
            <select
              className="w-full p-4 rounded-2xl bg-white border border-gray-200 focus:outline-none"
            >
              <option>Choose a board</option>
              <option>Design</option>
              <option>Development</option>
              <option>Travel</option>
            </select>
          </div>

        </div>

      </div>

    </div>
  );
}
