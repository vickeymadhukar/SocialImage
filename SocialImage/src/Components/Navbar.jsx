import { AiOutlineHome } from "react-icons/ai";
import { CiUser, CiSearch, CiSettings } from "react-icons/ci";
import { IoAddOutline } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { name: "Home", icon: <AiOutlineHome />, path: "/" },
    { name: "User", icon: <CiUser />, path: "/user" },
    { name: "Add", icon: <IoAddOutline />, path: "/upload" },
    { name: "Search", icon: <CiSearch />, path: "/search" },
    { name: "Setting", icon: <CiSettings />, path: "/setting" },
  ];

  // Detect active route automatically
  const active = menu.findIndex(
    (item) => item.path === location.pathname
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-5 z-50">
      <div className="relative w-[95%] max-w-md bg-black px-2 rounded-2xl shadow-black/50 shadow-lg">

        <ul className="flex relative">

          {/* Magic Moving Indicator */}
          {active !== -1 && (
            <span
              className="absolute pointer-events-none z-10
                         bg-blue-600 border-[6px] border-slate-100 
                         h-16 w-16 -top-8 rounded-full 
                         transition-all duration-500 shadow-lg"
              style={{
                left: `calc(${active * 20}% + 10%)`,
                transform: "translateX(-50%)",
              }}
            >
              {/* Left Curve */}
              <span className="absolute -left-[19px] top-[26px] h-4 w-4 bg-transparent rounded-tr-[15px] shadow-[4px_-4px_0_0_#fff]"></span>

              {/* Right Curve */}
              <span className="absolute -right-[18px] top-[26px] h-4 w-4 bg-transparent rounded-tl-[15px] shadow-[-4px_-4px_0_0_#fff]"></span>
            </span>
          )}

          {menu.map((item, i) => (
            <li key={i} className="flex-1">
              <button
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center text-center pt-4 pb-3 w-full relative z-20"
              >
                <span
                  className={`text-2xl duration-500 transition-all ${
                    i === active
                      ? "-mt-7 text-white"
                      : "text-white"
                  }`}
                >
                  {item.icon}
                </span>

                <span
                  className={`text-xs font-medium transition-all duration-500 ${
                    i === active
                      ? "opacity-100 translate-y-8 text-blue-600"
                      : "opacity-0 translate-y-4 text-white"
                  }`}
                >
                  {item.name}
                </span>
              </button>
            </li>
          ))}

        </ul>
      </div>
    </div>
  );
};

export default Navbar;
