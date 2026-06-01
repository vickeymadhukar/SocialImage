import { useRef } from "react";
import { CiSearch } from "react-icons/ci";
import { X } from "lucide-react";

const CATEGORIES = [
  "All",
  "Travel",
  "Food",
  "Art",
  "Fashion",
  "Nature",
  "Tech",
  "Architecture",
  "Animals",
  "Fitness",
];

const SearchBar = ({ value, onChange, selectedCategory, onCategoryChange }) => {
  const inputRef = useRef(null);

  return (
    <div className="w-full space-y-4">

      {/* Search Input */}
      <div
        className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3 border border-transparent focus-within:border-gray-300 focus-within:bg-white transition-all duration-200 shadow-sm"
        onClick={() => inputRef.current?.focus()}
      >
        <CiSearch className="text-gray-400 shrink-0" size={22} />

        <input
          ref={inputRef}
          id="search-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search images, styles, ideas..."
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
        />

        {value && (
          <button
            onClick={() => onChange("")}
            className="text-gray-400 hover:text-gray-600 transition shrink-0"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            id={`category-${cat.toLowerCase()}`}
            onClick={() => onCategoryChange(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === cat
                ? "bg-black text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

    </div>
  );
};

export default SearchBar;
