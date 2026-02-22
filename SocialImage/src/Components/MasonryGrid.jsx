function MasonryGrid({ posts }) {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
      {posts.map((post) => (
        <div
          key={post._id}
          className="break-inside-avoid bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:scale-[1.02] transition"
        >
          <img
            src={`http://localhost:5000/${post.image}`}
            alt=""
            className="w-full object-cover"
          />
          <div className="p-4">
            <p className="text-sm text-gray-300">
              {post.caption}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MasonryGrid;
