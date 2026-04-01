import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));

  useEffect(() => {
    const handleProfileUpdate = () => {
      setUser(JSON.parse(localStorage.getItem("user") || "{}"));
    };
    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("userProfileUpdated", handleProfileUpdate);
  }, []);

  if (user.role === "admin") return null;

  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#f9f9f9]/80 backdrop-blur-xl shadow-[0px_12px_32px_rgba(45,52,53,0.04)] transition-all">
      <div className="flex justify-between items-center px-6 py-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden flex items-center justify-center border border-outline-variant/20 hover:scale-110 active:scale-95 transition-all">
            {user.role === "admin" ? (
              <span className="material-symbols-outlined text-sm font-bold text-primary">admin_panel_settings</span>
            ) : (
              <img
                alt="User Profile"
                className="w-full h-full object-cover"
                src={user.profilePic || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "User") + "&background=random"}
                onError={(e) => {
                   e.target.onerror = null; 
                   e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "User") + "&background=random";
                }}
              />
            )}
          </Link>
          <span className="text-lg font-bold tracking-tighter text-[#1a1a1a]">
            TechClub
          </span>
        </div>
        <div className="flex items-center gap-4 text-[#5f5e5e]">
          <button onClick={() => navigate("/events")} className="material-symbols-outlined hover:text-[#1a1a1a] transition-colors cursor-pointer text-xl" title="Search Events">
            search
          </button>
          <button onClick={logout} className="material-symbols-outlined hover:text-error transition-colors cursor-pointer text-xl" title="Logout">
            logout
          </button>
        </div>
      </div>
    </header>
  );
}
