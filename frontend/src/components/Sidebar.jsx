import { Link, useLocation, useNavigate } from "react-router-dom";

function Sidebar() {

  const location = useLocation();

  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem("isLoggedIn");

    navigate("/login");

  };

  const menuItems = [

    {
      name: "Dashboard",
      path: "/",
      icon: "📊",
    },

    {
      name: "Products",
      path: "/products",
      icon: "📦",
    },

    {
      name: "Customers",
      path: "/customers",
      icon: "👥",
    },

    {
      name: "New Sale",
      path: "/new-sale",
      icon: "💰",
    },

    {
      name: "Sales List",
      path: "/sales-list",
      icon: "🧾",
    },

  ];

  return (

    <div className="
      w-72
      h-full
      bg-gradient-to-b
      from-[#F5F0E6]
      via-[#E8DCCB]
      to-[#D6C2A8]
      text-[#3E2F1C]
      flex
      flex-col
      justify-between
      p-5
      shadow-2xl
      border-r
      border-white/30
    ">

      {/* TOP SECTION */}
      <div>

        {/* LOGO */}
        <div className="mb-8">

          <div className="
            bg-white/40
            backdrop-blur-xl
            rounded-[28px]
            p-5
            shadow-xl
            border
            border-white/30
          ">

            <h1 className="
              text-3xl
              font-black
              tracking-wide
              text-[#3E2F1C]
            ">

              AL AMANA GROCERY
            </h1>

            <p className="
              text-[#6B5B4D]
              text-sm
              mt-2
            ">

              Business Management System

            </p>

          </div>

        </div>

        {/* MENU */}
        <div className="flex flex-col gap-3">

          {menuItems.map((item) => (

            <Link
              key={item.path}
              to={item.path}

              className={`group
                flex
                items-center
                gap-4
                px-5
                py-4
                rounded-[24px]
                transition-all
                duration-300
                text-[17px]
                font-medium

                ${
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-[#8B6B43] to-[#C8A97E] text-white shadow-2xl"
                    : "bg-white/20 hover:bg-white/40 text-[#5A4632]"
                }
              `}
            >

              <div className={`
                w-11
                h-11
                rounded-2xl
                flex
                items-center
                justify-center
                text-xl

                ${
                  location.pathname === item.path
                    ? "bg-white/20"
                    : "bg-[#C8A97E]/20"
                }
              `}>

                {item.icon}

              </div>

              <span>

                {item.name}

              </span>

            </Link>

          ))}

        </div>

      </div>

      {/* BOTTOM SECTION */}
      <div className="space-y-4">

        {/* ADMIN CARD */}
        <div className="
          bg-white/40
          backdrop-blur-xl
          p-5
          rounded-[28px]
          border
          border-white/30
          shadow-xl
        ">

          <p className="
            text-sm
            text-[#6B5B4D]
          ">

            Logged in as

          </p>

          <div className="
            flex
            items-center
            gap-3
            mt-3
          ">

            <div className="
              w-12
              h-12
              rounded-2xl
              bg-gradient-to-r
              from-[#8B6B43]
              to-[#C8A97E]
              flex
              items-center
              justify-center
              text-white
              font-bold
              text-lg
              shadow-lg
            ">

              A

            </div>

            <div>

              <h2 className="
                font-bold
                text-lg
                text-[#3E2F1C]
              ">

                Admin

              </h2>

              <p className="
                text-sm
                text-[#6B5B4D]
              ">

                System Administrator

              </p>

            </div>

          </div>

        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}

          className="
            w-full
            bg-gradient-to-r
            from-red-500
            to-pink-600
            hover:scale-[1.02]
            transition-all
            duration-300
            text-white
            py-4
            rounded-[24px]
            font-semibold
            shadow-2xl
            tracking-wide
          "
        >

          Logout

        </button>

      </div>

    </div>

  );
}

export default Sidebar;