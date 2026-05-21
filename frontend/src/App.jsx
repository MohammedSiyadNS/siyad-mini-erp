import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { Bell, Mail, RefreshCw, ChevronDown } from "lucide-react";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import NewSale from "./pages/NewSale";
import SalesList from "./pages/SalesList";
import Login from "./pages/Login";
import About from "./pages/About";

function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (!isLoggedIn) return <Navigate to="/login" />;
  return children;
}

function TopHeader() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";
  const initial = username.charAt(0).toUpperCase();

  const handleRefresh = () => {
    window.dispatchEvent(new Event("mini-erp:refresh-data"));
  };

  return (
    <div
      className="flex items-center gap-4 px-6 py-3 border-b flex-shrink-0"
      style={{
        background: "#FAF7F2",
        borderColor: "rgba(200,169,126,0.2)",
        minHeight: 60,
      }}
    >
      {/* global search removed */}

      <div className="flex items-center gap-2 ml-auto">
        {/* BELL */}
        <button
          className="rounded-xl p-2 transition-all"
          style={{ background: "rgba(139,107,67,0.08)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(139,107,67,0.16)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(139,107,67,0.08)")}
        >
          <Bell size={18} color="#6B5B4D" />
        </button>

        {/* MAIL */}
        <button
          className="rounded-xl p-2 transition-all"
          style={{ background: "rgba(139,107,67,0.08)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(139,107,67,0.16)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(139,107,67,0.08)")}
        >
          <Mail size={18} color="#6B5B4D" />
        </button>

        {/* REFRESH */}
        <button
          onClick={handleRefresh}
          className="rounded-xl p-2 transition-all"
          style={{ background: "rgba(139,107,67,0.08)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(139,107,67,0.16)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(139,107,67,0.08)")}
          title="Refresh data"
        >
          <RefreshCw size={18} color="#6B5B4D" />
        </button>

        {/* USER */}
        <button
          className="flex items-center gap-2 rounded-2xl px-3 py-2 transition-all"
          style={{ background: "rgba(139,107,67,0.08)" }}
          onClick={() => navigate("/login")}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(139,107,67,0.16)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(139,107,67,0.08)")}
        >
          <div
            className="flex items-center justify-center rounded-full font-bold text-white capitalize"
            style={{
              width: 30,
              height: 30,
              background: "linear-gradient(135deg, #8B6B43, #C8A97E)",
              fontSize: 13,
            }}
          >
            {initial}
          </div>
          <span className="text-sm font-semibold" style={{ color: "#3E2F1C" }}>
            {username}
          </span>
          <ChevronDown size={14} color="#6B5B4D" />
        </button>
      </div>
    </div>
  );
}

function Layout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: "#F5F0E6", paddingLeft: 220 }}>
      <Sidebar />
      <div className="flex flex-col min-h-screen overflow-hidden">
        <TopHeader />
        <div className="flex-1 overflow-auto p-5" style={{ minHeight: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Layout>
                <Customers />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/new-sale"
          element={
            <ProtectedRoute>
              <Layout>
                <NewSale />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sales-list"
          element={
            <ProtectedRoute>
              <Layout>
                <SalesList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <Layout>
                <About />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;