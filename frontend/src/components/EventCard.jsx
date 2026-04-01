export default function EventCard({ ev, isReg, registering, onRegister, onDelete, onManage, onEdit }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";
  const dateObj = new Date(ev.date);
  function formatEventDate(date) {
    try {
      return new Date(date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "TBA";
    }
  }

  // Choose placeholder image based on category if no custom image is set
  const imgUrl = ev.image || (ev.category === "hackathon" 
    ? "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800&h=400"
    : ev.category === "workshop"
    ? "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800&h=400"
    : "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=800&h=400");

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0px_12px_32px_rgba(45,52,53,0.04)] group transition-all hover:-translate-y-[2px]">
      <div className="h-48 relative overflow-hidden bg-surface-container-highest">
        <img alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={imgUrl} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex justify-between items-start">
             <div className="flex gap-2">
                <span className="text-[9px] uppercase tracking-widest bg-white/20 backdrop-blur px-2 py-0.5 rounded">
                  {ev.category}
                </span>
                <span className="text-[9px] uppercase tracking-widest bg-primary/80 backdrop-blur px-2 py-0.5 rounded font-black">
                  {ev.xp} XP
                </span>
             </div>
             {isAdmin && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(ev._id); }} className="w-8 h-8 rounded-lg bg-rose-500/80 backdrop-blur text-white flex items-center justify-center hover:bg-rose-600 transition-colors pointer-events-auto">
                   <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
             )}
          </div>
          <h3 className="text-xl font-bold mt-2 tracking-tight">{ev.title}</h3>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center gap-4 text-[11px] text-outline mb-3">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            {formatEventDate(ev.date)}
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            {new Date(ev.date).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
        
        <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2">
          {ev.description || "Deep dive and gain extra points in this upcoming technical session!"}
        </p>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-surface-variant"></div>
            <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-primary-container"></div>
            <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-surface-dim"></div>
            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-surface-container-high text-[8px] font-bold text-on-surface">
              +{(ev.registeredUsers?.length || 0)}
            </div>
          </div>
          
          {!isAdmin ? (
            <button
               onClick={() => onRegister(ev._id)}
               disabled={isReg || registering === ev._id}
               className={`px-4 py-2 rounded-lg text-xs font-semibold select-none transition-all active:scale-95 ${
                 isReg
                   ? "bg-surface-container-high text-on-surface-variant cursor-not-allowed"
                   : "bg-primary text-on-primary hover:shadow-lg cursor-pointer"
               }`}
            >
               {registering === ev._id
                 ? "Wait..."
                 : isReg
                 ? "Enrolled ✓"
                 : "Enroll"}
            </button>
          ) : (
             <div className="flex gap-2">
                <button
                   onClick={() => onManage && onManage(ev)}
                   className="p-2.5 rounded-xl bg-surface-container-low text-primary hover:bg-white shadow-sm ring-1 ring-outline-variant/10 transition-all cursor-pointer flex items-center justify-center"
                   title="Manage Attendees"
                >
                   <span className="material-symbols-outlined text-[18px]">account_circle</span>
                </button>
                <button
                   onClick={() => onEdit && onEdit(ev)}
                   className="p-2.5 rounded-xl bg-surface-container-low text-secondary hover:bg-white shadow-sm ring-1 ring-outline-variant/10 transition-all cursor-pointer flex items-center justify-center"
                   title="Edit Event"
                >
                   <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
