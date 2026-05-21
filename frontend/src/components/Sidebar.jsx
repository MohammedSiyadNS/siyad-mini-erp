import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  ClipboardList,
  Settings,
  ChevronDown,
} from "lucide-react";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const username = localStorage.getItem("username") || "Admin";
  const initial = username.charAt(0).toUpperCase();

  const menuItems = [
    { name: "Dashboard", path: "/", Icon: LayoutDashboard },
    { name: "Products", path: "/products", Icon: Package },
    { name: "Customers", path: "/customers", Icon: Users },
    { name: "New Sale", path: "/new-sale", Icon: ShoppingCart },
    { name: "Sales List", path: "/sales-list", Icon: ClipboardList },
  ];

  const accountItems = [
    { name: "About us", path: "/about", Icon: Settings },
  ];

  return (
    <div
      className="fixed left-0 top-0 bottom-0 flex flex-col p-5"
      style={{
        width: "220px",
        background: "linear-gradient(180deg, #2C1608 0%, #3D2010 100%)",
        color: "white",
        zIndex: 20,
      }}
    >
      {/* LOGO */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="flex items-center justify-center flex-shrink-0 rounded-xl"
          style={{ width: 36, height: 36, background: "#6B4F2A" }}
        >
          <ShoppingCart size={18} color="white" />
        </div>
        <div>
          <p className="font-black text-white leading-tight" style={{ fontSize: 11 }}>
            AL AMANA
          </p>
          <p className="font-black text-white leading-tight" style={{ fontSize: 11 }}>
            GROCERY
          </p>
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
            Business Management System
          </p>
        </div>
      </div>

      {/* MAIN MENU */}
      <nav className="flex flex-col gap-0.5">
        {menuItems.map(({ name, path, Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="flex items-center gap-3 rounded-xl transition-all duration-200"
              style={{
                padding: "10px 12px",
                fontSize: 14,
                fontWeight: 500,
                backgroundColor: isActive ? "#8B6B43" : "transparent",
                color: isActive ? "white" : "rgba(255,255,255,0.5)",
                textDecoration: "none",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <Icon size={18} />
              <span>{name}</span>
            </Link>
          );
        })}
      </nav>

      {/* ACCOUNT SECTION */}
      <div className="mt-8 flex-1">
        <p
          className="uppercase px-3 mb-2"
          style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)" }}
        >
          Account
        </p>
        <div className="flex flex-col gap-0.5">
          {accountItems.map(({ name, path, Icon }) => (
            <Link
              key={path}
              to={path}
              className="flex items-center gap-3 rounded-xl transition-all duration-200"
              style={{
                padding: "10px 12px",
                fontSize: 14,
                fontWeight: 500,
                color: "rgba(255,255,255,0.5)",
                textDecoration: "none",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Icon size={18} />
              <span>{name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ADMIN CARD (click to logout) */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-2xl w-full text-left transition-all"
        style={{ background: "#4A2C14", padding: "12px" }}
        title="Click to logout"
        onMouseEnter={e => (e.currentTarget.style.background = "#5A3A1A")}
        onMouseLeave={e => (e.currentTarget.style.background = "#4A2C14")}
      >
        <div
          className="flex items-center justify-center flex-shrink-0 rounded-xl font-bold capitalize"
          style={{
            width: 36,
            height: 36,
            background: "linear-gradient(135deg, #8B6B43, #C8A97E)",
            color: "white",
            fontSize: 14,
          }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="font-bold capitalize truncate" style={{ fontSize: 13, color: "white" }}>
            {username}
          </p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>System Administrator</p>
        </div>
        <ChevronDown size={14} color="rgba(255,255,255,0.3)" />
      </button>
    </div>
  );
}

export default Sidebar;
