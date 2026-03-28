import { NavLink } from "react-router-dom";

export default function BottomNav() {
   const user = JSON.parse(localStorage.getItem("user") || "{}");
   const isAdmin = user.role === "admin";

   if (isAdmin) return null;

   return (
    <nav className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <div className="bg-[#ffffff]/70 backdrop-blur-2xl rounded-full px-4 py-3 flex items-center gap-6 shadow-[0px_12px_32px_rgba(45,52,53,0.08)] pointer-events-auto border border-white/50">
        <NavLink
            to={isAdmin ? "/admin" : "/dashboard"}
            className={({ isActive }) =>
              isActive
                ? "bg-[#5f5e5e] text-white rounded-full p-2.5 flex items-center justify-center transition-transform active:scale-90 duration-200 shadow-xl"
                : "text-[#5f5e5e] p-2.5 opacity-40 hover:opacity-100 transition-opacity active:scale-90 duration-200 flex items-center justify-center cursor-pointer"
            }
            title={isAdmin ? "Portal Console" : "Dashboard"}
          >
            {({ isActive }) => (
              <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{isAdmin ? "terminal" : "view_quilt"}</span>
            )}
        </NavLink>

        <NavLink
            to="/events"
            className={({ isActive }) =>
              isActive
                ? "bg-[#5f5e5e] text-white rounded-full p-2.5 flex items-center justify-center transition-transform active:scale-90 duration-200"
                : "text-[#5f5e5e] p-2.5 opacity-40 hover:opacity-100 transition-opacity active:scale-90 duration-200 flex items-center justify-center cursor-pointer"
            }
            title="Events"
          >
            {({ isActive }) => (
              <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>emoji_events</span>
            )}
        </NavLink>

        <NavLink
            to="/projects"
            className={({ isActive }) =>
              isActive
                ? "bg-[#5f5e5e] text-white rounded-full p-2.5 flex items-center justify-center transition-transform active:scale-90 duration-200"
                : "text-[#5f5e5e] p-2.5 opacity-40 hover:opacity-100 transition-opacity active:scale-90 duration-200 flex items-center justify-center cursor-pointer"
            }
            title="Team"
          >
            {({ isActive }) => (
              <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>rocket_launch</span>
            )}
        </NavLink>

        <NavLink
            to="/polls"
            className={({ isActive }) =>
              isActive
                ? "bg-[#5f5e5e] text-white rounded-full p-2.5 flex items-center justify-center transition-transform active:scale-90 duration-200"
                : "text-[#5f5e5e] p-2.5 opacity-40 hover:opacity-100 transition-opacity active:scale-90 duration-200 flex items-center justify-center cursor-pointer"
            }
            title="Polls"
          >
            {({ isActive }) => (
              <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>poll</span>
            )}
        </NavLink>
        
        <NavLink
            to="/concerns"
            className={({ isActive }) =>
              isActive
                ? "bg-[#5f5e5e] text-white rounded-full p-2.5 flex items-center justify-center transition-transform active:scale-90 duration-200"
                : "text-[#5f5e5e] p-2.5 opacity-40 hover:opacity-100 transition-opacity active:scale-90 duration-200 flex items-center justify-center cursor-pointer"
            }
            title="Helpdesk"
          >
            {({ isActive }) => (
              <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>support_agent</span>
            )}
        </NavLink>
      </div>
    </nav>
  );
}
