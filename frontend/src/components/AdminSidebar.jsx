import { useNavigate, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: "Dashboard", path: "/admin", icon: "dashboard" },
    { label: "Events", path: "/events", icon: "calendar_today" },
    { label: "Projects", path: "/projects", icon: "rocket_launch" },
    { label: "Support", path: "/concerns", icon: "support_agent" },
    { label: "Polls", path: "/polls", icon: "poll" },
    { label: "Resources", path: "/resources", icon: "folder_open" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="w-80 bg-surface-container-lowest border-r border-outline-variant/10 flex flex-col h-screen sticky top-0 px-8 py-12 shrink-0">
      <div className="flex items-center gap-5 mb-16 px-2">
        <div className="w-14 h-14 rounded-[24px] bg-primary flex items-center justify-center shadow-2xl shadow-primary/30">
          <span className="material-symbols-outlined text-white font-black text-2xl">admin_panel_settings</span>
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-on-surface uppercase italic">Portal</h1>
          <p className="text-[10px] font-black text-primary opacity-60 uppercase tracking-[0.4em]">Admin Console</p>
        </div>
      </div>

      <nav className="flex-1 space-y-3">
        {navLinks.map(l => (
          <button 
            key={l.path} 
            onClick={() => navigate(l.path)}
            className={`w-full flex items-center gap-6 p-5 rounded-[28px] transition-all group ${location.pathname === l.path ? 'bg-primary text-on-primary shadow-2xl shadow-primary/20' : 'hover:bg-surface-container-low text-on-surface-variant'}`}
          >
            <span className={`material-symbols-outlined text-xl ${location.pathname === l.path ? 'text-white' : 'text-outline group-hover:text-primary transition-colors'}`}>{l.icon}</span>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{l.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-10 border-t border-outline-variant/10">
        <button onClick={handleLogout} className="w-full flex items-center gap-6 p-5 rounded-[28px] text-rose-500 hover:bg-rose-50 transition-all group">
          <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">logout</span>
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Logout</span>
        </button>
      </div>
    </aside>
  );
}
