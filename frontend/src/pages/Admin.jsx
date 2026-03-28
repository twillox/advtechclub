import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token");
}

function logout(navigate) {
  localStorage.clear();
  navigate("/login", { replace: true });
}

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState(null); 

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    xp: 10,
    category: "workshop",
  });

  const headers = useMemo(() => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchData = async () => {
    try {
      const [evRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/events`, { headers }),
        axios.get(`${API_BASE_URL}/api/user/stats`, { headers })
      ]);
      setEvents(evRes.data);
      setTotalUsers(statsRes.data.totalUsers || 0);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear();
        navigate("/login", { replace: true });
      }
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [headers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/events`, form, { headers });
      setCreating(false);
      setForm({ title: "", description: "", date: "", xp: 10, category: "workshop" });
      fetchData();
      alert("Event Created!");
    } catch (err) {
      console.error(err);
      alert("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/events/${id}`, { headers });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete event");
    }
  };

  const handleViewUsers = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/events/${id}/registrations`, { headers });
      setParticipants(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch participants");
    }
  };

  return (
    <>
      {/* Main Operational Area */}
      <main className="flex-1 min-h-screen flex flex-col bg-surface overflow-x-hidden">
        
        {/* Secure Operational Header */}
        <header className="h-28 px-12 flex justify-between items-center bg-white/40 backdrop-blur-md border-b border-outline-variant/5 sticky top-0 z-50">
           <div className="flex items-center gap-8">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-primary bg-primary/5 px-4 py-1.5 rounded-full uppercase tracking-[0.3em] w-fit mb-1">System Operational</span>
                 <span className="text-[11px] font-bold text-on-surface-variant/40 uppercase tracking-[0.1em]">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                 <p className="text-sm font-black text-on-surface tracking-tight">Council Overseer</p>
                 <p className="text-[10px] text-on-surface-variant font-black opacity-30 uppercase tracking-[0.2em]">Authorized Management Zone</p>
              </div>
              <div className="w-14 h-14 rounded-[20px] bg-surface-container-low border border-outline-variant/10 flex items-center justify-center shadow-inner">
                 <span className="material-symbols-outlined text-on-surface-variant/40">account_circle</span>
              </div>
           </div>
        </header>

        {/* Dynamic Matrix Grid */}
        <div className="p-12 max-w-7xl w-full mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            
            {/* Primary Command Strip */}
            <div className="xl:col-span-8 space-y-12">
              
              {/* Telemetry Core Metrics */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: "Total Agents", value: totalUsers, delta: "+18%", icon: "group_add", color: "text-blue-500" },
                  { label: "Active Ops", value: events.length, delta: "Live", icon: "sensors", color: "text-primary" },
                  { label: "Collective XP", value: "48.2k", delta: "+4k", icon: "database", color: "text-amber-500" },
                ].map(m => (
                  <div key={m.label} className="bg-white p-10 rounded-[48px] shadow-[0px_48px_96px_rgba(0,0,0,0.03)] border border-outline-variant/10 group hover:shadow-2xl transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                       <span className="material-symbols-outlined text-8xl font-black">{m.icon}</span>
                    </div>
                    <span className={`material-symbols-outlined ${m.color} bg-current/5 p-4 rounded-2xl mb-8 block w-fit font-black`}>{m.icon}</span>
                    <p className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-40">{m.label}</p>
                    <div className="flex items-end gap-3 mt-3">
                       <h3 className="text-5xl font-black tracking-tighter text-on-surface italic">{m.value}</h3>
                       <span className={`text-[10px] font-black ${m.delta.includes('+') ? 'text-green-600' : 'text-primary'} mb-2 tracking-widest`}>{m.delta}</span>
                    </div>
                  </div>
                ))}
              </section>

              {/* Engagement Analytics Engine */}
              <section className="bg-white p-12 rounded-[56px] shadow-[0px_64px_128px_rgba(0,0,0,0.02)] border border-outline-variant/10 space-y-12">
                <div className="flex justify-between items-center px-4">
                  <div className="space-y-2">
                      <h4 className="text-lg font-black tracking-tighter uppercase italic text-on-surface">System Throughput</h4>
                      <p className="text-[10px] text-on-surface-variant font-black opacity-30 uppercase tracking-[0.4em]">Real-time user engagement tracking</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/40 animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Live Activity</span>
                     </div>
                  </div>
                </div>
                <div className="flex items-end justify-between h-56 px-6 border-b border-outline-variant/5 pb-6">
                  {[45, 78, 42, 92, 65, 88, 72].map((h, i) => (
                    <div key={i} className="group relative flex flex-col items-center flex-1 mx-2">
                      <div className="absolute -top-12 bg-on-surface text-surface text-[10px] font-black px-4 py-2 rounded-[16px] opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-2xl scale-75 group-hover:scale-100">{h}% UPTIME</div>
                      <div className={`w-full rounded-t-[20px] transition-all duration-1000 ease-in-out ${h > 80 ? 'bg-primary shadow-2xl shadow-primary/40' : 'bg-surface-container-highest opacity-70 group-hover:opacity-100 hover:bg-primary/40'}`} style={{ height: `${h}%` }}></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between px-10">
                  {['OCT 01', 'OCT 02', 'OCT 03', 'OCT 04', 'OCT 05', 'OCT 06', 'OCT 07'].map(d => (
                    <span key={d} className="text-[10px] font-black tracking-widest text-on-surface-variant/30 uppercase">{d}</span>
                  ))}
                </div>
              </section>

              {/* Active Events Database */}
              <section className="space-y-10">
                 <div className="flex justify-between items-center px-6">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-on-surface">Events List ({events.length})</h4>
                    <button onClick={() => navigate("/events")} className="group flex items-center gap-3 text-[10px] font-black text-primary hover:text-on-surface transition-colors uppercase tracking-widest">
                       View Events Interface
                       <span className="material-symbols-outlined text-sm font-black group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-6">
                  {events.length === 0 ? (
                    <div className="text-[10px] font-black text-outline-variant/30 py-32 text-center bg-surface-container-low/20 rounded-[56px] border border-dashed border-outline-variant/40 italic uppercase tracking-[0.5em]">No active users detected.</div>
                  ) : (
                    events.map((ev) => (
                        <div key={ev._id} className="group bg-white p-8 rounded-[40px] flex items-center justify-between border border-outline-variant/10 shadow-sm hover:shadow-2xl hover:scale-[1.01] transition-all duration-500">
                          <div className="flex items-center gap-10 flex-1">
                            <div className="w-20 h-20 rounded-[32px] bg-surface-container-low flex items-center justify-center overflow-hidden border border-outline-variant/10 shadow-inner group-hover:bg-primary/5 transition-all">
                              <span className="material-symbols-outlined text-primary/40 text-3xl font-black group-hover:scale-110 transition-transform">
                                 {ev.category === 'hackathon' ? 'auto_awesome' : ev.category === 'workshop' ? 'terminal' : 'campaign'}
                              </span>
                            </div>
                            <div className="flex-1 space-y-2">
                              <p className="text-xl font-black tracking-tighter text-on-surface uppercase italic truncate">{ev.title}</p>
                              <div className="flex items-center gap-6">
                                 <span className="text-[10px] font-black bg-primary/5 text-primary px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-primary/5">{ev.category}</span>
                                 <div className="flex items-center gap-2 text-[10px] font-black text-on-surface-variant/30 uppercase tracking-widest">
                                    <span className="material-symbols-outlined text-sm font-black">calendar_today</span>
                                    {new Date(ev.date).toLocaleDateString()}
                                    <span className="mx-2">•</span>
                                    <span className="material-symbols-outlined text-sm font-black text-primary/40">groups</span>
                                    {(ev.registeredUsers || []).length} Verified Users
                                 </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => handleViewUsers(ev._id)} 
                              className="w-14 h-14 rounded-[20px] text-on-surface-variant bg-surface-container-low hover:bg-surface-container-high transition-all flex items-center justify-center border border-outline-variant/10 shadow-sm outline-none cursor-pointer group/btn"
                              title="Fetch Local Data"
                            >
                              <span className="material-symbols-outlined text-xl group-hover/btn:rotate-12 transition-transform">database</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(ev._id)} 
                              className="w-14 h-14 rounded-[20px] text-rose-500 bg-rose-50/20 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center border border-rose-100 shadow-sm outline-none cursor-pointer group/purge"
                              title="Permanently Purge"
                            >
                              <span className="material-symbols-outlined text-xl group-hover/purge:scale-110 transition-transform">delete</span>
                            </button>
                          </div>
                        </div>
                      )
                    )
                  )}
                 </div>
              </section>
            </div>

            {/* Support Command Area */}
            <div className="xl:col-span-4 space-y-12">
               {/* Terminal Interface: Event Deployment */}
               <section className="bg-on-surface text-surface p-12 rounded-[64px] shadow-[0px_80px_160px_rgba(0,0,0,0.1)] space-y-12 relative overflow-hidden group border border-white/10">
                  <div className="absolute top-0 right-0 p-16 opacity-5 scale-150 rotate-45 group-hover:rotate-90 transition-transform duration-2000 pointer-events-none">
                     <span className="material-symbols-outlined text-[200px] font-black text-surface">settings_input_component</span>
                  </div>
                  <div className="space-y-3 relative z-10">
                     <h3 className="text-3xl font-black tracking-tighter italic uppercase border-b border-surface/20 pb-6 mb-2 text-surface">Central Command</h3>
                     <p className="text-[10px] font-black text-primary opacity-60 tracking-[0.5em] uppercase">Initialize Sub-System</p>
                  </div>

                  <div className="space-y-6 relative z-10">
                     <button 
                       onClick={() => setCreating(!creating)}
                       className="w-full bg-primary text-on-primary py-7 rounded-[32px] text-[11px] font-black uppercase tracking-[0.4em] active:scale-[0.98] transition-all shadow-2xl shadow-primary/40 flex items-center justify-center gap-5 hover:brightness-110"
                     >
                       <span className="material-symbols-outlined text-sm font-black p-2 bg-white/20 rounded-xl">{creating ? "close" : "add"}</span>
                       {creating ? "ABORT OPERATION" : "BOOT NEW OPS"}
                     </button>
                     
                     {creating && (
                      <form onSubmit={handleCreate} className="space-y-5 animate-in fade-in zoom-in duration-700 pt-6">
                        <div className="space-y-4">
                           <input
                             type="text" required placeholder="Operation ID..."
                             className="w-full bg-surface/10 border border-surface/10 rounded-[20px] py-6 px-8 text-xs font-bold focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all text-white placeholder:text-surface/30 shadow-inner"
                             value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                           />
                           <div className="grid grid-cols-2 gap-4">
                              <select 
                                className="w-full bg-surface/10 border border-surface/10 rounded-[20px] py-6 px-8 text-xs font-bold focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all text-white appearance-none cursor-pointer"
                                value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                              >
                                <option value="workshop" className="bg-on-surface">Workshop</option>
                                <option value="hackathon" className="bg-on-surface">Hackathon</option>
                                <option value="seminar" className="bg-on-surface">Seminar</option>
                              </select>
                              <input
                                 type="number" required min="10" placeholder="XP Yield"
                                 className="w-full bg-surface/10 border border-surface/10 rounded-[20px] py-6 px-8 text-xs font-bold focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all text-white placeholder:text-surface/30 shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                 value={form.xp} onChange={e => setForm({...form, xp: Number(e.target.value)})}
                              />
                           </div>
                           <input
                             type="datetime-local" required
                             className="w-full bg-surface/10 border border-surface/10 rounded-[20px] py-6 px-8 text-xs font-bold focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all text-white inverted-scheme cursor-pointer"
                             value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                           />
                           <textarea
                             required rows="4" placeholder="Briefing data entry..."
                             className="w-full bg-surface/10 border border-surface/10 rounded-[20px] py-6 px-8 text-xs font-bold focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all text-white placeholder:text-surface/30 resize-none shadow-inner"
                             value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                           />
                        </div>
                        <button disabled={loading} className="w-full bg-white text-on-surface py-6 rounded-[32px] text-[11px] font-black uppercase tracking-[0.3em] active:scale-[0.98] transition-all shadow-3xl hover:bg-opacity-95 mt-4">
                          {loading ? "COMMITTING..." : "COMMIT TO DATABASE"}
                        </button>
                      </form>
                     )}
                  </div>
               </section>

               {/* Sector Metrics: Distribution */}
               <section className="bg-white p-12 rounded-[56px] border border-outline-variant/10 shadow-sm space-y-10">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-on-surface opacity-30 border-b border-outline-variant/10 pb-6">System Allocation</h4>
                  <div className="space-y-8">
                     {[
                        { label: 'Technical Ops', pct: 68, color: 'bg-primary' },
                        { label: 'Competitive Logic', pct: 42, color: 'bg-indigo-400' },
                        { label: 'Council Discourse', pct: 31, color: 'bg-rose-400' },
                     ].map(item => (
                        <div key={item.label} className="space-y-4">
                           <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.15em] text-on-surface group">
                              <span className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                                {item.label}
                              </span>
                              <span className="text-primary italic opacity-60">{item.pct}%</span>
                           </div>
                           <div className="h-3 bg-surface-container-low rounded-full overflow-hidden shadow-inner">
                              <div className={`h-full ${item.color} rounded-full transition-all duration-2000 ease-out shadow-lg`} style={{ width: `${item.pct}%` }}></div>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>
            </div>
          </div>
        </div>
      </main>

      {/* Roster Overlay Dashboard Style */}
      {participants && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-2xl z-[1000] flex justify-end animate-in fade-in duration-500">
           <aside className="w-[520px] bg-surface-container-lowest h-screen border-l border-outline-variant/10 p-16 space-y-16 animate-in slide-in-from-right-full duration-700 shadow-[-40px_0_120px_rgba(0,0,0,0.1)] relative">
              <button 
                onClick={() => setParticipants(null)}
                className="absolute top-12 right-12 w-16 h-16 rounded-[24px] bg-surface-container-low flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all cursor-pointer group outline-none shadow-inner"
              >
                 <span className="material-symbols-outlined text-2xl group-hover:rotate-180 transition-transform duration-500">close</span>
              </button>

              <div className="space-y-4 border-l-8 border-primary pl-8">
                 <h2 className="text-5xl font-black text-on-surface tracking-tighter uppercase italic leading-none">User Directory</h2>
                 <p className="text-[11px] font-black text-primary opacity-60 uppercase tracking-[0.5em]">{participants.length} Active Connections Synchronized</p>
              </div>

              <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-340px)] pr-6 custom-scrollbar">
                 {participants.map(p => (
                   <div key={p._id} className="flex items-center gap-6 bg-surface-container-low/30 p-8 rounded-[40px] border border-outline-variant/5 hover:border-primary/20 hover:bg-white transition-all duration-500 group shadow-sm hover:shadow-2xl">
                      <div className="w-16 h-16 rounded-[24px] bg-primary flex items-center justify-center text-sm font-black text-white uppercase group-hover:scale-110 transition-transform shadow-2xl shadow-primary/20">{p.name?.charAt(0)}</div>
                      <div className="flex-1 overflow-hidden space-y-1">
                         <p className="text-lg font-black text-on-surface truncate uppercase italic tracking-tighter">{p.name}</p>
                         <p className="text-[11px] font-black text-on-surface-variant/20 truncate lowercase tracking-widest">{p.email}</p>
                      </div>
                      <div className="text-right space-y-1">
                         <p className="text-xs font-black text-primary uppercase italic">RANK {p.level || 1}</p>
                         <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">{p.xp || 0} XP ENGAGEMENT</p>
                      </div>
                   </div>
                 ))}
                 {participants.length === 0 && (
                   <div className="flex flex-col items-center justify-center py-32 space-y-6 opacity-20 filter grayscale">
                      <span className="material-symbols-outlined text-8xl font-black">wifi_off</span>
                      <p className="italic font-black uppercase tracking-[0.5em] text-xs">No Secure Data Signal Detected.</p>
                   </div>
                 )}
              </div>

              <button className="w-full bg-on-surface text-surface py-7 rounded-[32px] text-[11px] font-black uppercase tracking-[0.4em] shadow-3xl flex items-center justify-center gap-6 hover:bg-black transition-all group overflow-hidden relative">
                 <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                 <span className="material-symbols-outlined text-sm font-black relative z-10">download</span>
                 <span className="relative z-10">Download User Database</span>
              </button>
           </aside>
        </div>
      )}
    </>
  );
}
