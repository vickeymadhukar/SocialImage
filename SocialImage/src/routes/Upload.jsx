import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Camera, Image, FolderOpen, X } from "lucide-react";
import { compressImage } from "../utils/compressor.js";

export default function Upload() {
  const { isAuthenticated, user, loginWithRedirect, isLoading } = useAuth0();
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const qualityPreset = localStorage.getItem("socialimage_upload_optimization") || "high";
        const optimizedFile = await compressImage(file, qualityPreset);
        setImage(optimizedFile);
      } catch (error) {
        console.error("Compression failed, using original file:", error);
        setImage(file);
      }
      setIsDrawerOpen(false);
    }
  };


  useEffect(() => {

    if (!isAuthenticated && !isLoading || !user) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, user, loginWithRedirect])

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isAuthenticated) {
      setError("Please login to upload a post");
      return;
    }

    if (!image || !caption) {
      setError("Please select an image and add a description");
      return;
    }

    // Pre-upload validation: Check if file size is > 5MB
    if (image.size > 5 * 1024 * 1024) {
      setError("Image size is too large! Maximum allowed size is 5MB. Please compress your image or select a smaller file.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("caption", caption);
    formData.append("userId", user.sub);

    let progressInterval = null;

    try {
      setUploading(true);
      setUploadProgress(0);

      // Smooth progress animation: Increments up to 95% over 1-2 seconds
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          // Increments faster at first, then slows down
          const increment = Math.max(1, Math.round((98 - prev) * 0.12));
          return prev + increment;
        });
      }, 70);
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/createpost`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // In case the network is slower than the simulation, take the higher progress
            setUploadProgress((prev) => Math.max(prev, percentCompleted));
          },
        }
      );

      // Once done, clear simulation and complete to 100%
      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(100);

      // Short delay so the user can see the 100% complete bar before it resets
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSuccess("Post uploaded successfully!");
      setImage(null);
      setCaption("");
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setSuccess("");
      }, 5000);

    } catch (err) {
      if (progressInterval) clearInterval(progressInterval);
      console.error("Upload error details:", err);
      const errMsg = err.response?.data?.message || err.message || "Upload failed. Please try again.";
      setError(errMsg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  const generateAICaption = async () => {

    // Add your CNN + LSTM AI caption generation logic here

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
            disabled={uploading}
            className={`px-6 py-3 rounded-full font-semibold transition duration-200 ease-in-out ${
              uploading 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-sm"
            }`}
          >
            {uploading ? "Publishing..." : "Publish"}
          </button>
        </div>

      </div>

      {/* Inline Notifications & Progress Bar */}
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-2xl flex items-start gap-3 shadow-xs animate-fade-in transition duration-300">
            <div className="text-red-500 mt-0.5 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-800 text-sm">Upload Failed</h4>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 transition shrink-0">
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-2xl flex items-start gap-3 shadow-xs animate-fade-in transition duration-300">
            <div className="text-emerald-500 mt-0.5 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-emerald-800 text-sm">Success!</h4>
              <p className="text-xs text-emerald-700 mt-0.5">{success}</p>
            </div>
            <button onClick={() => setSuccess("")} className="text-emerald-400 hover:text-emerald-600 transition shrink-0">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Bar Loading Indicator */}
        {uploading && (
          <div className="mb-8 bg-gray-50 border border-gray-100 rounded-2xl p-5 shadow-xs transition-all duration-300">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                <span className="text-sm font-semibold text-gray-700">Uploading your post...</span>
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 md:gap-22 gap-15">


        <div className="bg-gray-200 rounded-3xl p-6 shadow-sm">

          <div
            onClick={() => setIsDrawerOpen(true)}
            className="border-2 border-dashed border-gray-300 
                       rounded-3xl h-[400px] flex flex-col 
                       items-center justify-center text-center 
                       cursor-pointer hover:bg-gray-100/50 transition duration-300 overflow-hidden"
          >
            {image ? (
              <div className="relative w-full h-full group">
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="h-full w-full object-cover rounded-3xl"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDrawerOpen(true);
                    }}
                    className="bg-white text-black px-5 py-2.5 rounded-full font-semibold shadow-lg hover:scale-105 active:scale-95 transition"
                  >
                    Change Media
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImage(null);
                    }}
                    className="bg-red-600 text-white p-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 p-6">
                <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center bg-white shadow-sm hover:scale-110 transition duration-300">
                  <Image size={28} className="text-black" />
                </div>

                <p className="text-lg font-semibold text-gray-800">
                  Choose a file or drag & drop here
                </p>

                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                  Click to choose from your Gallery, Camera, or browse files (like Snapchat and Downloads)
                </p>
              </div>
            )}
          </div>
        </div>


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
            <button
              type="button"
              className="mt-3 bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition"
              onClick={generateAICaption}
            >
              AI
            </button>
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

      {/* Hidden Inputs for different upload methods */}
      <input
        type="file"
        ref={galleryInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <input
        type="file"
        ref={cameraInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Instagram / Snapchat Style Bottom Drawer */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end md:items-center justify-center transition-all duration-300 ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDrawerOpen(false)}
      >
        <div 
          className={`bg-white rounded-t-[32px] md:rounded-3xl w-full md:max-w-md p-6 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
            isDrawerOpen ? "translate-y-0 scale-100" : "translate-y-full md:translate-y-10 md:scale-95"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile handle indicator */}
          <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upload Media</h2>
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Choose where you'd like to import your media from. Like Instagram or Snapchat!
          </p>

          <div className="grid grid-cols-1 gap-4">
            {/* Gallery Option */}
            <button
              onClick={() => {
                galleryInputRef.current.click();
              }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-100/50 hover:border-purple-200 active:scale-[0.98] transition-all text-left w-full"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Image size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Photo Gallery</h3>
                <p className="text-xs text-gray-500">Choose from your photos and library</p>
              </div>
            </button>

            {/* Camera Option */}
            <button
              onClick={() => {
                cameraInputRef.current.click();
              }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-100/50 hover:border-blue-200 active:scale-[0.98] transition-all text-left w-full"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
                <Camera size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Take Photo</h3>
                <p className="text-xs text-gray-500">Use camera to capture directly</p>
              </div>
            </button>

            {/* Files / Downloads Option */}
            <button
              onClick={() => {
                fileInputRef.current.click();
              }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 border border-amber-100/50 hover:border-amber-200 active:scale-[0.98] transition-all text-left w-full"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-white shadow-md">
                <FolderOpen size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Browse Files</h3>
                <p className="text-xs text-gray-500">Snapchat, downloads, or generic files</p>
              </div>
            </button>
          </div>

          <button
            onClick={() => setIsDrawerOpen(false)}
            className="w-full py-4 mt-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-2xl active:scale-[0.98] transition-all text-center"
          >
            Cancel
          </button>
        </div>
      </div>

    </div>
  );
}
