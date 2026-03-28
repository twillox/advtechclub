import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Navigate } from "react-router-dom";
const API = import.meta.env.VITE_API_URL;


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
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

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const payload = isLogin ? { email, password } : { name, email, password };

      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);

      if (isLogin) {
        const { token, user } = response.data;
        // Strictly save info
        localStorage.setItem("token", token);
        localStorage.setItem("role", user.role);
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect based on role
        if (user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        alert("Registration successful. Please log in.");
        setIsLogin(true);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-surface font-sans">
      <div className="w-full max-w-sm space-y-12">

        <header className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-12 group hover:rotate-0 transition-transform cursor-pointer">
            <span className="material-symbols-outlined text-white text-2xl font-black">rocket_launch</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-on-surface">TechClub Portal</h1>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60">Authentication Gateway</p>
        </header>

        <form
          onSubmit={handleAuth}
          className="bg-surface-container-lowest p-10 rounded-[40px] shadow-[0px_32px_80px_rgba(45,52,53,0.06)] border border-outline-variant/5 space-y-8"
        >
          <div className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1 border-l-2 border-primary ml-2 pl-3">Full Identity</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container-low/50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-outline/40"
                  placeholder="e.g. Satoshi Nakamoto"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1 border-l-2 border-primary ml-2 pl-3">Network Key (Email)</label>
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
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1 border-l-2 border-primary ml-2 pl-3">Password</label>
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
            {loading ? "Loading..." : isLogin ? "LOG IN" : "REGISTER"}
          </button>

          <p className="text-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 cursor-pointer hover:text-primary transition-colors mt-4" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Need new credentials? Create Link" : "Already verified? Access Session"}
          </p>
        </form>

        <footer className="text-center text-[9px] font-bold uppercase tracking-widest text-outline/30 space-y-2">
          <p>© {new Date().getFullYear()} TECHCLUB OPS. ALL SYSTEMS GO.</p>
          <div className="flex justify-center gap-4">
            <span>GDPR COMPLIANT</span>
            <span className="opacity-40">•</span>
            <span>SECURE LOGIN</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
