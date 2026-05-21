import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, LogIn } from "lucide-react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (username === "admin" && password === "1234") {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", username);
      navigate("/");
    } else {
      setError("Invalid Username or Password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E6] via-[#E8DCCB] to-[#D6C2A8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* CARD */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-[35px] shadow-2xl border border-white/30 p-10">
          
          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-[#8B6B43] to-[#C8A97E] p-4 rounded-3xl shadow-lg w-fit mx-auto mb-6">
              <LogIn className="text-white" size={32} />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-[#3E2F1C] tracking-tight mb-2">
              AL AMANA GROCERY
            </h1>
            
            <p className="text-[#6B5B4D] text-base">
              Enterprise Resource Planning 
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            
            {/* USERNAME INPUT */}
            <div>
              <label className="text-sm font-semibold text-[#5A4632] mb-2 block">
                Username
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-4 text-[#8B7B6B]"
                />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/50 border border-white/30 text-[#3E2F1C] rounded-2xl py-3 pl-12 pr-5 outline-none placeholder-[#8B7B6B] focus:ring-2 focus:ring-[#C8A97E] transition-all"
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div>
              <label className="text-sm font-semibold text-[#5A4632] mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-4 text-[#8B7B6B]"
                />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/50 border border-white/30 text-[#3E2F1C] rounded-2xl py-3 pl-12 pr-5 outline-none placeholder-[#8B7B6B] focus:ring-2 focus:ring-[#C8A97E] transition-all"
                />
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="bg-red-100/60 border border-red-300 text-red-700 px-4 py-3 rounded-2xl text-sm font-semibold">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#8B6B43] to-[#C8A97E] hover:scale-[1.02] transition-all duration-300 text-white py-3 rounded-2xl text-lg font-bold shadow-2xl flex items-center justify-center gap-2 mt-2"
            >
              <LogIn size={20} />
              Login
            </button>
          </form>

          {/* DEMO CREDENTIALS */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-center text-[#6B5B4D] text-sm mb-3 font-semibold">
              Demo Credentials
            </p>
            <div className="bg-white/20 rounded-2xl p-4 space-y-2 text-center">
              <p className="text-[#3E2F1C] font-medium">
                Username: <span className="font-bold">admin</span>
              </p>
              <p className="text-[#3E2F1C] font-medium">
                Password: <span className="font-bold">1234</span>
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <p className="text-center text-[#6B5B4D] text-sm mt-6">
          © 2026 Mini ERP. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;