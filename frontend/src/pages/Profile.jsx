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
    <div className="bg-[#f8f9fa] text-[#2d3435] min-h-screen pb-40 font-sans selection:bg-primary/10">
      <Navbar />
      
      <main className="pt-32 px-6 max-w-5xl mx-auto space-y-12">
        
        {/* Header Hero */}
        <section className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[48px] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
           <div className="relative bg-white/70 backdrop-blur-3xl p-10 rounded-[48px] border border-white/50 shadow-2xl flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
              
              <div className="relative">
                 <div className="w-40 h-40 rounded-[40px] bg-gradient-to-br from-surface-container-high to-surface-container shadow-inner flex items-center justify-center overflow-hidden border-4 border-white">
                    {user.profilePic ? (
                       <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                       <span className="material-symbols-outlined text-7xl text-outline/20">fingerprint</span>
                    )}
                 </div>
                 {isMe && !editing && (
                    <button onClick={() => setEditing(true)} className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all outline-none cursor-pointer">
                       <span className="material-symbols-outlined text-base">edit_note</span>
                    </button>
                 )}
              </div>

              <div className="flex-1 space-y-6">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 justify-center md:justify-start">
                         <h1 className="text-4xl font-black tracking-tighter text-[#2d3435] uppercase italic">{user.name}</h1>
                         {user.role === 'admin' && <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Council</span>}
                      </div>
                      <p className="text-sm font-bold text-on-surface-variant/60 tracking-tight mt-1">{user.department || "No Department Set"} • Year {user.year || "N/A"}</p>
                    </div>
                    {isMe && (
                       <div className="flex items-center gap-2 bg-surface-container-low p-2 rounded-2xl border border-outline-variant/10">
                          <code className="text-[10px] font-black opacity-40 px-3">@{user.username || 'unclaimed'}</code>
                          <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/user/${user.username}`)} className="p-2 hover:bg-white rounded-xl transition-all cursor-pointer">
                             <span className="material-symbols-outlined text-[16px]">share</span>
                          </button>
                       </div>
                    )}
                 </div>

                 {/* Gamification Bar */}
                 <div className="space-y-3">
                    <div className="flex justify-between items-end">
                       <div className="flex items-center gap-2">
                          <span className="text-xl font-black italic tracking-tighter" style={{ color: levelData.color }}>Lvl. {user.level}</span>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">— {levelData.label}</span>
                       </div>
                       <span className="text-[10px] font-black text-primary uppercase">XP: {user.xp} / {levelData.next === Infinity ? 'MAX' : levelData.next}</span>
                    </div>
                    <div className="h-4 bg-surface-container-low rounded-full p-1 border border-outline-variant/10 shadow-inner overflow-hidden">
                       <div 
                          className="h-full rounded-full shadow-[0px_4px_12px_rgba(0,0,0,0.1)] transition-all duration-1000 ease-out"
                          style={{ backgroundColor: levelData.color, width: `${progressPct}%` }}
                       ></div>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 text-center md:text-left">
                       {levelData.next === Infinity ? "Apex Level Reached" : `${levelData.next - user.xp} XP needed for next evolution`}
                    </p>
                 </div>
              </div>
           </div>
        </section>

        {/* Stats Summary Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
              { label: "Points", val: user.xp, icon: "toll", color: "text-amber-500" },
              { label: "Global Rank", val: `#${user.rank || '??'}`, icon: "leaderboard", color: "text-rose-500" },
              { label: "Credentials", val: user.certificates?.length || 0, icon: "card_membership", color: "text-blue-500" },
              { label: "Badges", val: user.badges?.length || 0, icon: "verified", color: "text-purple-500" },
           ].map((s, i) => (
              <div key={i} className="bg-white/40 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-lg flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-all">
                 <span className={`material-symbols-outlined text-2xl mb-2 ${s.color}`}>{s.icon}</span>
                 <p className="text-2xl font-black italic tracking-tighter leading-none">{s.val}</p>
                 <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">{s.label}</p>
              </div>
           ))}
        </section>

        {/* Dynamic Tabs */}
        <section className="space-y-8">
           <div className="flex gap-2 bg-surface-container-low/50 p-2 rounded-3xl w-fit mx-auto border border-outline-variant/10 overflow-x-auto scrollbar-hide">
              {["overview", "projects", "achievements", "activity"].map(t => (
                 <button 
                  key={t} onClick={() => setActiveTab(t)}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${activeTab === t ? 'bg-white text-primary shadow-xl scale-105' : 'text-outline hover:text-on-surface opacity-50'}`}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="md:col-span-2 space-y-8">
                          {/* Skills & Interests */}
                          <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-outline-variant/5">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">architecture</span>
                                Knowledge Tree & Interests
                             </h4>
                             <div className="flex flex-wrap gap-2">
                                {user.skills?.map((s, i) => (
                                   <span key={i} className="px-5 py-2.5 bg-primary/5 text-primary rounded-xl text-[11px] font-black uppercase tracking-tight border border-primary/10">{s}</span>
                                ))}
                                {user.interests?.map((s, i) => (
                                   <span key={i} className="px-5 py-2.5 bg-secondary/5 text-secondary rounded-xl text-[11px] font-black uppercase tracking-tight border border-secondary/10">{s}</span>
                                ))}
                                {(!user.skills?.length && !user.interests?.length) && <p className="text-xs italic text-outline opacity-40">No attributes mapped...</p>}
                             </div>
                          </div>

                          {/* Progression Hints */}
                          {isMe && (
                            <div className="bg-gradient-to-br from-primary to-secondary p-8 rounded-[40px] shadow-[0px_20px_40px_rgba(0,0,0,0.1)] text-white relative overflow-hidden flex items-center gap-6">
                               <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
                                  <span className="material-symbols-outlined text-9xl">rocket</span>
                               </div>
                               <div className="bg-white/20 p-4 rounded-3xl">
                                  <span className="material-symbols-outlined text-3xl">lightbulb_circle</span>
                               </div>
                               <div className="relative z-10">
                                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Strategic Tip</p>
                                  <p className="text-lg font-black tracking-tight leading-tight mt-1">{user.xp < 100 ? "Attend 1 more event to become a 'Rising Maker'!" : "Submit a project to earn the 'Architect' badge."}</p>
                                </div>
                            </div>
                          )}
                       </div>

                       <div className="space-y-8">
                          {/* Badges Preview */}
                          <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-outline-variant/5">
                             <div className="flex justify-between items-center mb-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Top Badges</h4>
                                <button className="text-[9px] font-black uppercase text-primary tracking-widest">View All</button>
                             </div>
                             <div className="grid grid-cols-3 gap-4">
                                {user.badges?.slice(0, 6).map((b, i) => (
                                   <div key={i} className="group relative">
                                      <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-all border border-outline-variant/10">
                                         <span className="material-symbols-outlined text-2xl text-primary">{b.icon || 'star'}</span>
                                      </div>
                                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#2d3435] text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                         {b.name}
                                      </div>
                                   </div>
                                ))}
                                {(!user.badges || user.badges.length === 0) && <div className="text-[10px] font-bold text-outline opacity-20 uppercase col-span-3 text-center py-4 italic border-2 border-dashed border-outline-variant/10 rounded-2xl">Awaiting Recognition</div>}
                             </div>
                          </div>
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
            <div className="fixed inset-0 bg-background/80 backdrop-blur-2xl z-[100] p-6 flex items-center justify-center overscroll-none transition-all duration-500 ease-in-out">
               <div 
                  className="bg-white w-full max-w-2xl rounded-[48px] shadow-[0px_40px_100px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90vh]"
               >
                  <div className="bg-primary p-8 text-white flex justify-between items-center">
                     <div>
                        <h2 className="text-2xl font-black tracking-tighter uppercase italic">Refine Identity</h2>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60">Profile Management</p>
                     </div>
                     <button onClick={() => setEditing(false)} className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all outline-none border-none cursor-pointer">
                        <span className="material-symbols-outlined font-black">close</span>
                     </button>
                  </div>
                  
                  <form onSubmit={handleUpdate} className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 italic">Full Name</label>
                           <input type="text" className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-1 focus:ring-primary/20 transition-all" value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 italic">Username (@)</label>
                           <input type="text" className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-1 focus:ring-primary/20 transition-all" value={editForm.username} onChange={e=>setEditForm({...editForm, username: e.target.value})} />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 italic">Sector / Dept</label>
                           <input type="text" className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-1 focus:ring-primary/20 transition-all" value={editForm.department} onChange={e=>setEditForm({...editForm, department: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 italic">Academic Cycle (Year)</label>
                           <input type="text" className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-1 focus:ring-primary/20 transition-all" value={editForm.year} onChange={e=>setEditForm({...editForm, year: e.target.value})} />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 italic">Profile Avatar Link (URL)</label>
                        <input type="url" className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-1 focus:ring-primary/20 transition-all" value={editForm.profilePic} onChange={e=>setEditForm({...editForm, profilePic: e.target.value})} />
                     </div>

                     <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 italic">Technical Skill Set (Press Enter)</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                           {editForm.skills?.map((s, i) => (
                              <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold flex items-center gap-2">
                                 {s}
                                 <button type="button" onClick={() => setEditForm({...editForm, skills: editForm.skills.filter((_, idx)=>idx!==i)})} className="hover:text-black">×</button>
                              </span>
                           ))}
                        </div>
                        <input 
                           type="text" placeholder="Add skill..." 
                           className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-1 focus:ring-primary/20 transition-all"
                           onKeyDown={e => {
                              if (e.key === 'Enter') {
                                 e.preventDefault();
                                 const val = e.target.value.trim();
                                 if (val && !editForm.skills?.includes(val)) {
                                    setEditForm({...editForm, skills: [...(editForm.skills||[]), val]});
                                    e.target.value = '';
                                 }
                              }
                           }}
                        />
                     </div>

                     <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 italic">Research Interests (Press Enter)</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                           {editForm.interests?.map((s, i) => (
                              <span key={i} className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg text-[10px] font-bold flex items-center gap-2">
                                 {s}
                                 <button type="button" onClick={() => setEditForm({...editForm, interests: editForm.interests.filter((_, idx)=>idx!==i)})} className="hover:text-black">×</button>
                              </span>
                           ))}
                        </div>
                        <input 
                           type="text" placeholder="Add interest..." 
                           className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-1 focus:ring-secondary/20 transition-all"
                           onKeyDown={e => {
                              if (e.key === 'Enter') {
                                 e.preventDefault();
                                 const val = e.target.value.trim();
                                 if (val && !editForm.interests?.includes(val)) {
                                    setEditForm({...editForm, interests: [...(editForm.interests||[]), val]});
                                    e.target.value = '';
                                 }
                              }
                           }}
                        />
                     </div>

                     <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm font-black italic uppercase tracking-tight">Public Connectivity</p>
                              <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Make profile public</p>
                           </div>
                           <button type="button" onClick={() => setEditForm({...editForm, publicVisibility: !editForm.publicVisibility})} className={`w-14 h-8 rounded-full transition-all relative ${editForm.publicVisibility ? 'bg-primary' : 'bg-surface-container-highest'}`}>
                              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${editForm.publicVisibility ? 'left-7' : 'left-1'}`}></div>
                           </button>
                        </div>
                     </div>

                     <button type="submit" className="w-full bg-on-surface text-surface py-5 rounded-[24px] text-[10px] font-black tracking-[0.4em] uppercase hover:bg-black transition-all shadow-3xl active:scale-95 cursor-pointer">Sync Identity</button>
                  </form>
               </div>
            </div>
         )}

      <BottomNav />
    </div>
  );
}
