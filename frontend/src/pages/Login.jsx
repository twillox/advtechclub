import { useState } from "react";
import axios from "axios";
import { useNavigate, Navigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in, redirect away automatically
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token) {
    if (role === "admin") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });

      const { token, user } = response.data;
      // Save login info
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-surface font-sans">
      <div className="w-full max-w-sm space-y-12">

        <header className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-2xl font-black">rocket_launch</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-on-surface">ADVANCED TECH CLUB</h1>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant opacity-60">Member Login</p>
        </header>

        <form
          onSubmit={handleLogin}
          className="bg-surface-container-lowest p-10 rounded-[40px] shadow-[0px_32px_80px_rgba(45,52,53,0.06)] border border-outline-variant/5 space-y-8"
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1 border-l-2 border-primary ml-2 pl-3">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-low/50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-outline/40"
                placeholder="you@university.edu"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1 border-l-2 border-primary ml-2 pl-3">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-low/50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-outline/40"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-on-surface text-surface py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl hover:shadow-2xl hover:bg-black disabled:opacity-40"
          >
            {loading ? "Loading..." : "LOG IN"}
          </button>

          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-outline/50 mt-4">
            Contact admin for login credentials
          </p>
        </form>

        <footer className="text-center text-[9px] font-bold uppercase tracking-widest text-outline/30 space-y-2">
          <p>© {new Date().getFullYear()} ADVANCED TECH CLUB. All rights reserved.</p>
          <div className="flex justify-center gap-4">
            <span>SECURE LOGIN</span>
            <span className="opacity-40">•</span>
            <span>MEMBERS ONLY</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
