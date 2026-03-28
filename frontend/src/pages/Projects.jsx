import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", category: "Web App" });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/projects`, { headers });
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch(err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/projects`, form, { headers });
      setForm({ title: "", description: "", category: "Web App" });
      fetchProjects();
      alert("Project Created!");
    } catch(err) { alert("Failed to create space"); }
  };

  const handleJoin = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/api/projects/${id}/join`, {}, { headers });
      fetchProjects();
      alert("Connection request sent to owner!");
    } catch(err) { alert("Request failed"); }
  };

   const isAdmin = user.role === "admin";
   const myProjects = isAdmin ? projects : projects.filter(p => p.members.some(m => m._id === user._id));
   const otherProjects = isAdmin ? [] : projects.filter(p => !p.members.some(m => m._id === user._id));

   return (
    <div className="bg-surface text-on-surface min-h-screen pb-32 font-sans selection:bg-primary/20">
      <Navbar />
      <main className={`pt-24 px-6 ${isAdmin ? 'max-w-7xl' : 'max-w-4xl'} mx-auto space-y-12`}>
        
        <div className={`${isAdmin ? 'w-full' : 'max-w-md'} mx-auto space-y-12`}>
           <header className="text-center space-y-2 border-b border-outline-variant/10 pb-8">
             <h1 className="text-5xl font-black tracking-tight text-on-surface uppercase italic italic-shadow">{isAdmin ? "Admin Portal" : "Projects"}</h1>
             <p className="text-xs text-on-surface-variant tracking-[0.4em] font-black opacity-40 uppercase">{isAdmin ? "Admin Dashboard" : "Create • Collaborate • Build"}</p>
           </header>

           {/* Initiation Center - Only for students or if admin wants to test */}
           {!isAdmin && (
              <form onSubmit={handleCreate} className="bg-primary text-on-primary p-10 rounded-[48px] shadow-2xl shadow-primary/20 space-y-6 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-all duration-1000"></div>
                <div className="relative z-10 space-y-6">
                   <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                      <span className="material-symbols-outlined text-sm font-black p-2 bg-white/20 rounded-xl">shuttle</span>
                      Create New Project
                   </h3>
                   <div className="space-y-4">
                      <input required type="text" placeholder="Project codename..." className="w-full bg-white/10 border-none rounded-2xl py-5 px-6 text-sm font-bold focus:ring-0 focus:outline-none placeholder:text-white/30" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                      <textarea required placeholder="Brief project description & tech stack..." rows="2" className="w-full bg-white/10 border-none rounded-2xl py-5 px-6 text-sm font-bold focus:ring-0 focus:outline-none placeholder:text-white/30 resize-none" value={form.description} onChange={e=>setForm({...form, description: e.target.value})}></textarea>
                   </div>
                   <button className="w-full bg-white text-primary py-5 rounded-[24px] text-[10px] font-black tracking-[0.2em] uppercase active:scale-95 transition-all shadow-xl hover:shadow-2xl hover:bg-opacity-95">CREATE PROJECT</button>
                </div>
              </form>
           )}

           {/* My Active Teams / Master Roster */}
           <section className="space-y-8">
             <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant border-l-4 border-primary pl-6">{isAdmin ? "All Projects" : "Active My-Teams"}</h2>
             {myProjects.length === 0 && <p className="text-xs text-on-surface-variant font-medium text-center py-16 bg-surface-container-low/20 rounded-[40px] border border-dashed border-outline-variant/30 italic opacity-40">Zero active submissions detected in this sector.</p>}
             <div className="grid grid-cols-1 gap-6">
               {myProjects.map(p => {
                 const isOwner = p.owner._id === user._id || isAdmin;
                 return (
                   <div key={p._id} className="bg-surface-container-lowest p-8 rounded-[40px] shadow-[0px_32px_80px_rgba(45,52,53,0.04)] border border-outline-variant/5 space-y-6 group transition-all hover:bg-surface-container-low/50 hover:shadow-2xl hover:-translate-y-1">
                      <div className="flex justify-between items-start">
                         <div className="space-y-2">
                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${p.status === 'Submitted' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-primary/5 text-primary border border-primary/10'}`}>{p.status}</span>
                            <h3 className="font-black text-xl tracking-tight text-on-surface mt-4">{p.title}</h3>
                         </div>
                         <div className="flex -space-x-3">
                            {p.members.slice(0,4).map(m => (
                              <div key={m._id} className="w-10 h-10 rounded-2xl bg-surface-container-high border-4 border-surface-container-lowest flex items-center justify-center text-[10px] font-black uppercase shadow-sm group-hover:rotate-6 transition-transform" title={m.name}>
                                 {m.name.charAt(0)}
                              </div>
                            ))}
                            {p.members.length > 4 && <div className="w-10 h-10 rounded-2xl bg-surface-container-low border-4 border-surface-container-lowest flex items-center justify-center text-[10px] font-black shadow-sm">+{p.members.length-4}</div>}
                         </div>
                      </div>
                      <p className="text-xs text-on-surface-variant font-medium line-clamp-2 leading-relaxed opacity-70">{p.description}</p>
                      
                      <div className="flex gap-2">
                        <button onClick={()=>navigate(`/projects/${p._id}`)} className="flex-1 bg-on-surface text-surface rounded-[20px] py-4 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl hover:bg-black">
                           {isAdmin ? "SUPERVISE SPACE" : isOwner ? "MANAGE WORKSPACE" : "ENTER WORKSPACE"}
                        </button>
                        {isAdmin && (
                           <button className="w-14 h-14 bg-error/5 text-error rounded-2xl flex items-center justify-center hover:bg-error/10 transition-colors border border-error/5 outline-none cursor-pointer">
                              <span className="material-symbols-outlined text-lg">delete</span>
                           </button>
                        )}
                      </div>
                   </div>
                 );
               })}
             </div>
           </section>

           {/* Other Opportunities */}
           {!isAdmin && otherProjects.length > 0 && (
              <section className="space-y-8 pt-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant border-l-4 border-outline-variant pl-6">Scale Up (Opportunities)</h2>
                <div className="grid grid-cols-1 gap-4">
                  {otherProjects.map(p => {
                    const isPending = p.joinRequests?.some(r => r._id === user._id);
                    return (
                    <div key={p._id} className="bg-surface-container-low/30 p-8 rounded-[40px] border border-outline-variant/10 space-y-4 transition-all hover:bg-surface-container-lowest hover:shadow-xl group">
                        <div className="flex justify-between items-center">
                           <h3 className="font-black text-sm text-on-surface uppercase tracking-tighter group-hover:text-primary transition-colors">{p.title}</h3>
                           <span className="text-[9px] font-black text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full">{p.members.length} MEMBERS</span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant/60 font-black line-clamp-1 italic tracking-tight">{p.description}</p>
                        <button 
                          onClick={()=>handleJoin(p._id)} 
                          disabled={isPending}
                          className={`w-full ${isPending ? 'bg-surface-container-high opacity-50 cursor-not-allowed' : 'bg-surface-container-highest shadow-sm hover:shadow-lg hover:bg-white'} text-on-surface rounded-[20px] py-4 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all`}
                        >
                           {isPending ? "REQUEST SENT" : "JOIN PROJECT"}
                        </button>
                    </div>
                    )
                  })}
                </div>
              </section>
           )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
