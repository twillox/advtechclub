import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LEVEL_INFO = [
  { level: 4, label: "Legendary Architect", minXp: 700, next: Infinity, color: "#f59e0b" },
  { level: 3, label: "Senior Contributor", minXp: 300, next: 700, color: "#8b5cf6" },
  { level: 2, label: "Rising Maker", minXp: 100, next: 300, color: "#3b82f6" },
  { level: 1, label: "Initiate Member", minXp: 0, next: 100, color: "#10b981" },
];

export default function Profile() {
  const { username } = useParams(); // For public profile
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activeTab, setActiveTab] = useState("overview");

  const isPublic = !!username;
  const isMe = !isPublic || (JSON.parse(localStorage.getItem("user") || "{}").username === username);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const endpoint = isPublic ? `/api/user/public/${username}` : "/api/user/profile";
      const res = await axios.get(`${API_BASE_URL}${endpoint}`, isPublic ? {} : { headers });
      setUser(res.data);
      setEditForm(res.data);
    } catch (err) {
      console.error(err);
      if (!isPublic) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const res = await axios.put(`${API_BASE_URL}/api/user/profile`, editForm, { headers });
      setUser(res.data);
      setEditing(false);
      localStorage.setItem("user", JSON.stringify(res.data));
      window.dispatchEvent(new Event("userProfileUpdated"));
      alert("Profile Updated.");
    } catch (err) {
      alert(err.response?.data?.msg || "Update failure");
    }
  };

  const levelData = useMemo(() => {
    if (!user) return LEVEL_INFO[3];
    return LEVEL_INFO.find(l => user.xp >= l.minXp) || LEVEL_INFO[3];
  }, [user]);

  const progressPct = useMemo(() => {
    if (!user || levelData.next === Infinity) return 100;
    const currentLevelMin = levelData.minXp;
    const nextLevelMin = levelData.next;
    return Math.min(100, ((user.xp - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100);
  }, [user, levelData]);

  if (loading) return (
    <div className="bg-background min-h-screen flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <div className="p-20 text-center text-outline">User not found.</div>;

  return (
    <div className="bg-[#f8f9fa] text-[#2d3435] min-h-screen pb-48 font-sans selection:bg-primary/10">
      <Navbar />
      
      <main className="pt-24 px-4 md:px-6 max-w-5xl mx-auto space-y-12">
        
        {/* Header Hero */}
        <section className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[48px] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
           <div className="relative bg-white/70 backdrop-blur-3xl p-6 md:p-10 rounded-[48px] border border-white/50 shadow-2xl flex flex-col md:flex-row gap-6 md:gap-10 items-center text-center md:text-left">
              
              <div className="relative flex-shrink-0">
                 <div className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] bg-gradient-to-br from-surface-container-high to-surface-container shadow-inner flex items-center justify-center overflow-hidden border-4 border-white">
                    {user.profilePic ? (
                       <img 
                          src={user.profilePic} 
                          alt={user.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                             e.target.onerror = null; 
                             e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name) + "&background=random";
                          }}
                       />
                    ) : (
                       <span className="material-symbols-outlined text-5xl md:text-7xl text-outline/20">fingerprint</span>
                    )}
                 </div>
                 {isMe && !editing && (
                    <button onClick={() => setEditing(true)} className="absolute -bottom-2 -right-2 bg-primary text-white p-2 md:p-3 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all outline-none cursor-pointer">
                       <span className="material-symbols-outlined text-sm md:text-base">edit_note</span>
                    </button>
                 )}
              </div>

              <div className="flex-1 w-full min-w-0 space-y-4 md:space-y-6">
                 <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                       <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-[#2d3435] uppercase truncate max-w-full">{user.name}</h1>
                       {user.role === 'admin' && <span className="bg-rose-500 text-white text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter flex-shrink-0">Council</span>}
                    </div>
                    <p className="text-xs md:text-sm font-bold text-on-surface-variant/60 truncate">{user.department || "No Department Set"} • {user.year || "N/A"}</p>
                 </div>
                 
                 {isMe && (
                    <div className="flex items-center gap-2 bg-surface-container-low p-2 rounded-2xl border border-outline-variant/10 max-w-full w-fit">
                       <code className="text-[9px] md:text-[10px] font-black opacity-40 px-2 truncate">@{user.username || 'unclaimed'}</code>
                       <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/user/${user.username}`); alert("Profile URL Copied!"); }} className="p-2 hover:bg-white rounded-xl transition-all cursor-pointer flex-shrink-0" title="Share Profile">
                          <span className="material-symbols-outlined text-[14px] md:text-[16px]">share</span>
                       </button>
                    </div>
                 )}

                 {/* Gamification Bar */}
                 <div className="space-y-2 md:space-y-3">
                    <div className="flex justify-between items-end flex-wrap gap-2">
                       <div className="flex items-center gap-2">
                          <span className="text-lg md:text-xl font-black italic tracking-tighter" style={{ color: levelData.color }}>Lvl. {user.level}</span>
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hidden sm:inline">— {levelData.label}</span>
                       </div>
                       <span className="text-[8px] md:text-[10px] font-black text-primary uppercase">XP: {user.xp} / {levelData.next === Infinity ? 'MAX' : levelData.next}</span>
                    </div>
                    <div className="h-3 md:h-4 bg-surface-container-low rounded-full p-0.5 md:p-1 border border-outline-variant/10 shadow-inner overflow-hidden">
                       <div 
                          className="h-full rounded-full shadow-[0px_4px_12px_rgba(0,0,0,0.1)] transition-all duration-1000 ease-out"
                          style={{ backgroundColor: levelData.color, width: `${progressPct}%` }}
                       ></div>
                    </div>
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] opacity-30">
                       {levelData.next === Infinity ? "Max Level" : `${levelData.next - user.xp} XP to next level`}
                    </p>
                 </div>
              </div>
           </div>
        </section>

        {/* Stats Summary Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
           {[
              { label: "Points", val: user.xp, icon: "toll", color: "text-amber-500" },
              { label: "Rank", val: `#${user.rank || '??'}`, icon: "leaderboard", color: "text-rose-500" },
              { label: "Certificates", val: user.certificates?.length || 0, icon: "card_membership", color: "text-blue-500" },
              { label: "Badges", val: user.badges?.length || 0, icon: "verified", color: "text-purple-500" },
           ].map((s, i) => (
              <div key={i} className="bg-white/40 backdrop-blur-xl p-8 md:p-10 rounded-[32px] border border-white/60 shadow-lg flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-all min-h-[140px] md:min-h-[160px]">
                 <span className={`material-symbols-outlined text-3xl md:text-4xl mb-3 md:mb-4 ${s.color}`}>{s.icon}</span>
                 <p className="text-3xl md:text-4xl font-black italic tracking-tighter leading-tight truncate max-w-full pb-1">{s.val}</p>
                 <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] opacity-40 mt-1 md:mt-2 text-center">{s.label}</p>
              </div>
           ))}
        </section>

        {/* Dynamic Tabs */}
        <section className="space-y-6">
           <div className="flex gap-2 bg-surface-container-low/50 p-2 rounded-3xl w-fit mx-auto border border-outline-variant/10 overflow-x-auto scrollbar-hide">
              {["overview", "projects", "achievements", "activity"].map(t => (
                 <button 
                  key={t} onClick={() => setActiveTab(t)}
                  className={`px-6 md:px-8 py-2 md:py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer whitespace-nowrap ${activeTab === t ? 'bg-white text-primary shadow-xl scale-105' : 'text-outline hover:text-on-surface opacity-50'}`}
                 >
                    {t}
                 </button>
              ))}
           </div>

           <div className="transition-all duration-300">
              <div 
                 className={`opacity-100 transition-opacity duration-300`}
              >
                 {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                       <div className="md:col-span-2 space-y-6 md:space-y-8">
                          {/* Skills & Interests */}
                          <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-2xl border border-outline-variant/5">
                             <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-4 md:mb-6 flex items-center gap-2 flex-wrap">
                                <span className="material-symbols-outlined text-sm md:text-base">architecture</span>
                                Skills & Interests
                             </h4>
                             <div className="flex flex-wrap gap-2">
                                {user.skills?.map((s, i) => (
                                   <span key={i} className="px-4 py-2 md:px-5 md:py-2.5 bg-primary/5 text-primary rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-tight border border-primary/10 max-w-full truncate">{s}</span>
                                ))}
                                {user.interests?.map((s, i) => (
                                   <span key={i} className="px-4 py-2 md:px-5 md:py-2.5 bg-secondary/5 text-secondary rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-tight border border-secondary/10 max-w-full truncate">{s}</span>
                                ))}
                                {(!user.skills?.length && !user.interests?.length) && <p className="text-xs italic text-outline opacity-40">No skills or interests added yet</p>}
                             </div>
                          </div>

                           {/* Progression Hints */}
                           {isMe && (
                             <div className="bg-gradient-to-br from-primary to-secondary p-8 rounded-[40px] shadow-[0px_20px_40px_rgba(0,0,0,0.1)] text-white relative overflow-hidden flex items-center gap-6 self-start w-full">
                                <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
                                   <span className="material-symbols-outlined text-9xl">rocket</span>
                                </div>
                                <div className="bg-white/20 p-4 rounded-3xl flex-shrink-0">
                                   <span className="material-symbols-outlined text-3xl">lightbulb_circle</span>
                                </div>
                                <div className="relative z-10 w-full pr-8">
                                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Strategic Tip</p>
                                   <p className="text-lg font-black tracking-tight leading-tight mt-1">{user.xp < 100 ? "Attend 1 more event to become a 'Rising Maker'!" : "Submit a project to earn the 'Architect' badge."}</p>
                                 </div>
                             </div>
                           )}
                        </div>

                        <div className="space-y-8 w-full">
                           {/* Badges Preview */}
                           <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-outline-variant/5">
                              <div className="flex justify-between items-center mb-6">
                                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Top Badges</h4>
                                 <button onClick={() => setActiveTab("achievements")} className="text-[9px] font-black uppercase text-primary tracking-widest cursor-pointer hover:underline">View All</button>
                              </div>
                              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                 {user.badges?.slice(0, 6).map((b, i) => {
                                    const badgeName = b.name || b || "Badge";
                                    const badgeIcon = b.icon || 'star';
                                    return (
                                    <div key={i} className="group relative mx-auto">
                                       <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-all border border-outline-variant/10">
                                          <span className="material-symbols-outlined text-2xl text-primary">{badgeIcon}</span>
                                       </div>
                                       <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#2d3435] text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                          {typeof badgeName === 'string' ? badgeName : (badgeName.name || 'Achievement')}
                                       </div>
                                    </div>
                                    );
                                 })}
                                 {(!user.badges || user.badges.length === 0) && <div className="text-[10px] font-bold text-outline opacity-20 uppercase col-span-2 lg:col-span-3 text-center py-4 italic border-2 border-dashed border-outline-variant/10 rounded-2xl">Awaiting Recognition</div>}
                              </div>
                           </div>
                        </div>
                     </div>
                 )}

                  {activeTab === 'achievements' && (
                     <div className="bg-white p-6 md:p-10 rounded-[48px] shadow-2xl border border-outline-variant/5 max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                           <span className="material-symbols-outlined text-2xl text-purple-500">verified</span>
                           <h3 className="text-sm font-black uppercase tracking-[0.3em] opacity-60">All Earned Badges</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                           {user.badges?.map((b, i) => {
                              const badgeName = b.name || b || "Badge";
                              const badgeIcon = b.icon || 'star';
                              const badgeDate = b.dateEarned ? new Date(b.dateEarned).toLocaleDateString() : 'AWAITING';
                              return (
                              <div key={i} className="flex flex-col items-center text-center space-y-3 group bg-surface-container-low p-6 rounded-[32px] hover:shadow-xl transition-all border border-outline-variant/10">
                                 <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-rotate-12 transition-all border border-outline-variant/5">
                                    <span className="material-symbols-outlined text-4xl text-primary">{badgeIcon}</span>
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black uppercase tracking-tight text-on-surface">{typeof badgeName === 'string' ? badgeName : (badgeName.name || 'Achievement')}</p>
                                    <p className="text-[8px] font-bold uppercase opacity-40 mt-1">{badgeDate}</p>
                                 </div>
                              </div>
                              );
                           })}
                           {(!user.badges || user.badges.length === 0) && <div className="col-span-full text-center py-16 italic opacity-20 uppercase font-black tracking-[0.5em] text-outline">No badges claimed yet</div>}
                        </div>
                     </div>
                  )}

                 {activeTab === 'projects' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {user.projects?.map((p, i) => (
                          <div key={i} className="bg-white p-8 rounded-[40px] border border-outline-variant/5 shadow-xl space-y-4 hover:translate-y-[-4px] transition-all group">
                             <div className="flex justify-between items-start">
                                <div className="p-3 bg-secondary/10 text-secondary rounded-2xl group-hover:scale-110 transition-all">
                                   <span className="material-symbols-outlined">rocket_launch</span>
                                </div>
                                <span className="text-[9px] font-black uppercase px-2 py-1 rounded-full bg-surface-container-low border border-outline-variant/10 opacity-60">Project</span>
                             </div>
                             <div>
                                <h3 className="text-xl font-black tracking-tight italic uppercase">{p.title}</h3>
                                <p className="text-xs text-on-surface-variant font-medium mt-2 leading-relaxed opacity-60 line-clamp-2">{p.description}</p>
                             </div>
                             {p.link && (
                                <a href={p.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase text-secondary tracking-widest hover:translate-x-1 transition-all">
                                   Access Repository <span className="material-symbols-outlined text-sm">north_east</span>
                                </a>
                             )}
                          </div>
                       ))}
                       {user.projects?.length === 0 && <div className="col-span-2 text-center py-24 italic opacity-20 uppercase font-black tracking-[0.5em] text-outline">No Repositories indexed</div>}
                    </div>
                 )}

                 {activeTab === 'activity' && (
                    <div className="bg-white p-10 rounded-[48px] shadow-2xl space-y-8 max-w-2xl mx-auto border border-outline-variant/5">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-outline opacity-40">Timeline Feed</h3>
                        <div className="relative pl-8 space-y-12">
                           <div className="absolute left-[3px] top-2 bottom-0 w-[1px] bg-outline-variant/20"></div>
                           
                           {user.activityLog?.slice().reverse().map((a, i) => (
                              <div key={i} className="relative">
                                 <div className="absolute -left-[33px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-4 border-white shadow-xl"></div>
                                 <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-outline opacity-40 uppercase tracking-widest">{new Date(a.date).toLocaleDateString()}</span>
                                    <p className="text-sm font-bold text-on-surface italic">"{a.action}"</p>
                                 </div>
                              </div>
                           ))}
                           {user.activityLog?.length === 0 && <div className="text-center italic opacity-20 uppercase font-black text-outline">Timeline Silent</div>}
                        </div>
                    </div>
                 )}
              </div>
           </div>
        </section>

      </main>

      {/* Profile Edit Overlay */}
      {editing && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-2xl z-[100] p-4 md:p-6 flex items-center justify-center overscroll-none transition-all duration-500 ease-in-out">
               <div 
                  className="bg-white w-full max-w-xl rounded-[32px] shadow-[0px_40px_100px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90vh]"
               >
                  <div className="bg-primary p-6 text-white flex justify-between items-center">
                     <div>
                        <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase">Edit Profile</h2>
                        <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.3em] opacity-60">Update your information</p>
                     </div>
                     <button onClick={() => setEditing(false)} className="bg-white/10 p-2 md:p-3 rounded-2xl hover:bg-white/20 transition-all outline-none border-none cursor-pointer">
                        <span className="material-symbols-outlined font-black text-lg md:text-xl">close</span>
                     </button>
                  </div>
                  
                  <form onSubmit={handleUpdate} className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                           <label className="text-[9px] font-bold uppercase tracking-wide opacity-60">Full Name</label>
                           <input type="text" className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-1 focus:ring-primary/20 transition-all" value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-bold uppercase tracking-wide opacity-60">Username (@)</label>
                           <input type="text" className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-1 focus:ring-primary/20 transition-all" value={editForm.username} onChange={e=>setEditForm({...editForm, username: e.target.value})} />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                           <label className="text-[9px] font-bold uppercase tracking-wide opacity-60">Department</label>
                           <input type="text" className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-1 focus:ring-primary/20 transition-all" value={editForm.department} onChange={e=>setEditForm({...editForm, department: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-bold uppercase tracking-wide opacity-60">Year of Study</label>
                           <select className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-1 focus:ring-primary/20 transition-all" value={editForm.year} onChange={e=>setEditForm({...editForm, year: e.target.value})}>
                              <option value="">Select Year</option>
                              <option value="1st Year">1st Year</option>
                              <option value="2nd Year">2nd Year</option>
                              <option value="3rd Year">3rd Year</option>
                              <option value="4th Year">4th Year</option>
                              <option value="Graduate">Graduate</option>
                           </select>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-wide opacity-60">Profile Picture URL</label>
                        <input type="url" className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-1 focus:ring-primary/20 transition-all" value={editForm.profilePic} onChange={e=>setEditForm({...editForm, profilePic: e.target.value})} placeholder="https://example.com/photo.jpg" />
                     </div>

                     <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                        <label className="text-[9px] font-bold uppercase tracking-wide opacity-60">Skills (comma separated)</label>
                        <textarea 
                           className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                           rows="3"
                           value={(editForm.skills || []).join(', ')}
                           onChange={e => setEditForm({...editForm, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                           placeholder="Python, JavaScript, UI/UX Design"
                        />
                     </div>

                     <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                        <label className="text-[9px] font-bold uppercase tracking-wide opacity-60">Interests (comma separated)</label>
                        <textarea 
                           className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                           rows="3"
                           value={(editForm.interests || []).join(', ')}
                           onChange={e => setEditForm({...editForm, interests: e.target.value.split(',').map(i => i.trim()).filter(Boolean)})}
                           placeholder="AI/ML, Web Development, Robotics"
                        />
                     </div>

                     <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm font-bold italic">Public Profile</p>
                              <p className="text-[8px] font-medium opacity-60 uppercase">Make profile visible to others</p>
                           </div>
                           <button type="button" onClick={() => setEditForm({...editForm, publicVisibility: !editForm.publicVisibility})} className={`w-14 h-8 rounded-full transition-all relative ${editForm.publicVisibility ? 'bg-primary' : 'bg-surface-container-highest'}`}>
                              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${editForm.publicVisibility ? 'left-7' : 'left-1'}`}></div>
                           </button>
                        </div>
                     </div>

                     <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl text-sm font-bold uppercase tracking-wide hover:bg-primary/90 transition-all shadow-lg active:scale-95 cursor-pointer">Save Changes</button>
                  </form>
               </div>
            </div>
         )}

      <BottomNav />
    </div>
  );
}
