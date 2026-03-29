import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token");
}

function formatCompact(xp) {
  if (typeof xp !== "number") return "0";
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(1)}M`;
  if (xp >= 1_000) return `${(xp / 1_000).toFixed(1)}k`;
  return String(xp);
}

function logout(navigate) {
  localStorage.clear();
  navigate("/login", { replace: true });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);

  const headers = useMemo(() => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setProfile(JSON.parse(stored));
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [p, lb, ev, allEv] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/user/profile`, { headers }),
          axios.get(`${API_BASE_URL}/api/user/leaderboard`),
          axios.get(`${API_BASE_URL}/api/events/registered/me`, { headers }),
          axios.get(`${API_BASE_URL}/api/events`, { headers }),
        ]);
        if (active) {
          setProfile(p.data);
          localStorage.setItem("user", JSON.stringify(p.data));
          setLeaderboard(Array.isArray(lb.data) ? lb.data : []);
          setRegisteredEvents(Array.isArray(ev.data) ? ev.data : []);
          setAllEvents(Array.isArray(allEv.data) ? allEv.data : []);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          logout(navigate);
        } else {
          console.error(err);
        }
      }
    }
    load();
    return () => { active = false; };
  }, [headers, navigate]);

  const sortedEvents = useMemo(() => {
    const regIds = new Set(registeredEvents.map(e => String(e._id)));
    return allEvents
      .filter(e => !regIds.has(String(e._id)))
      .sort((a, b) => (a.registeredUsers?.length || 0) - (b.registeredUsers?.length || 0))
      .slice(0, 3);
  }, [allEvents, registeredEvents]);

  const name = profile?.name || "Member";
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const progressPct = Math.min(100, Math.max(0, Math.round((xp % 100) || 0)));

  const rank = leaderboard.findIndex(u => String(u._id) === String(profile?._id)) + 1;

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long', month: 'short', day: 'numeric'
  });

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      <Navbar />

      <main className="pt-24 px-6 space-y-12 max-w-4xl mx-auto">
        
        {/* Welcome Section */}
        <div className="max-w-md mx-auto space-y-12">
          <section className="space-y-1 text-center">
            <span className="label-md uppercase tracking-[0.1em] text-on-surface-variant text-[10px] font-medium">
              {todayStr}
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Welcome, {name}.</h1>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              You have {registeredEvents.length} upcoming events and new challenges waiting.
            </p>
          </section>

          {/* XP Overview */}
          <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-[0px_12px_48px_rgba(45,52,53,0.06)] relative overflow-hidden group border border-outline-variant/10">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-8xl">insights</span>
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-primary">
                  Level {level} Architect
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter text-on-surface">
                    {xp.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-on-surface-variant uppercase">XP Earned</span>
                </div>
              </div>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                  <circle className="text-surface-container-high" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="2"></circle>
                  <circle className="text-primary transition-all duration-1000 ease-out" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175" strokeDashoffset={175 - (175 * progressPct) / 100} strokeWidth="4" strokeLinecap="round"></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black text-on-surface">{progressPct}%</span>
                </div>
              </div>
            </div>
            <div className="mt-6 h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progressPct}%` }}></div>
            </div>
          </section>

          {/* Quick Operations Grid */}
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest font-bold text-on-surface-variant px-1 border-l-2 border-primary pl-3">Quick Operations</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "EVENTS", icon: "emoji_events", path: "/events", color: "text-primary" },
                { label: "TEAM", icon: "rocket_launch", path: "/projects", color: "text-blue-500" },
                { label: "REPO", icon: "folder_open", path: "/resources", color: "text-amber-500" },
                { label: "POLLS", icon: "poll", path: "/polls", color: "text-indigo-500" },
                { label: "CHAT", icon: "forum", path: "/chat", color: "text-emerald-500" },
                { label: "HELP", icon: "support_agent", path: "/concerns", color: "text-rose-500" },
              ].map((op) => (
                <button
                  key={op.label}
                  onClick={() => navigate(op.path)}
                  className="flex flex-col items-center justify-center gap-3 bg-surface-container-lowest p-5 rounded-2xl shadow-[0px_8px_24px_rgba(45,52,53,0.04)] hover:-translate-y-1 transition-all active:scale-95 border border-outline-variant/10 group h-full"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center transition-colors group-hover:bg-primary/10`}>
                     <span className={`material-symbols-outlined text-[24px] ${op.color}`}>{op.icon}</span>
                  </div>
                  <span className="text-[10px] font-black text-on-surface-variant tracking-widest">{op.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Registered Events */}
          <section className="space-y-6">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-xs uppercase tracking-widest font-bold text-on-surface-variant border-l-2 border-primary pl-3">My Regestrations</h2>
              <button onClick={() => navigate("/events")} className="text-[10px] font-black text-primary hover:underline">EXPLORE ALL</button>
            </div>
            <div className="space-y-4">
              {registeredEvents.length === 0 ? (
                <div className="text-sm text-outline py-12 text-center bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant shadow-sm">
                  No registrations yet. Explore events to gain XP!
                </div>
              ) : (
                  registeredEvents.map(ev => {
                    const evDate = new Date(ev.date);
                    return (
                      <article key={ev._id} className="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0px_4px_16px_rgba(45,52,53,0.03)] flex hover:-translate-y-[2px] transition-all border border-outline-variant/5">
                        <div className="w-20 flex-none bg-surface-container-highest flex flex-col items-center justify-center p-4 border-r border-outline-variant/10">
                          <span className="text-xl font-black tracking-tighter text-primary">
                            {evDate.getDate().toString().padStart(2, '0')}
                          </span>
                          <span className="text-[9px] uppercase font-black tracking-widest opacity-60 text-on-surface">
                            {evDate.toLocaleString(undefined, { month: 'short' })}
                          </span>
                        </div>
                        <div className="p-5 flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-sm leading-tight text-on-surface line-clamp-1">{ev.title}</h3>
                            <span className="material-symbols-outlined text-sm text-outline pointer-events-none">arrow_forward_ios</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-on-surface-variant uppercase tracking-wider">
                            <span className="material-symbols-outlined text-xs">schedule</span>
                             {evDate.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </article>
                    )
                  })
              )}
            </div>
          </section>

          {/* Recommended / AI Module */}
          <section className="bg-primary text-on-primary rounded-3xl p-8 relative overflow-hidden group shadow-2xl shadow-primary/20">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000 border border-white/10"></div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-primary">Curated Events</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black leading-tight tracking-tight text-on-primary">High-Impact Opportunites</h3>
                <p className="text-xs text-on-primary/70 leading-relaxed font-medium">Events with limited seats remaining. Perfect for high growth.</p>
              </div>
              
              <div className="space-y-3">
                {sortedEvents.length > 0 ? sortedEvents.map(ev => (
                  <div key={ev._id} className="bg-white/10 backdrop-blur-md p-4 rounded-xl flex items-center justify-between border border-white/5">
                    <span className="text-xs font-bold truncate pr-4">{ev.title}</span>
                    <span className="text-[9px] font-black bg-white/20 px-2 py-1 rounded">{(ev.registeredUsers?.length || 0)} Regs</span>
                  </div>
                )) : (
                  <div className="text-center text-xs opacity-60 py-4">No events discovered yet.</div>
                )}
              </div>

              <button onClick={() => navigate("/events")} className="w-full bg-white text-primary py-4 rounded-xl text-xs font-black tracking-widest uppercase hover:bg-opacity-90 transition-all active:scale-95 shadow-lg">
                  BROWSE CONSOLE
              </button>
            </div>
          </section>
        </div>

        {/* Big Leaderboard Section */}
        <section className="space-y-8 mt-20 pb-20">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-on-surface">Global Standings</h2>
            <p className="text-on-surface-variant text-sm font-medium uppercase tracking-widest">The elite TechClub ranking</p>
          </div>

          <div className="bg-surface-container-lowest rounded-[32px] overflow-hidden shadow-[0px_32px_80px_rgba(45,52,53,0.08)] border border-outline-variant/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/10 bg-surface-container-low/50">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Rank</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Contributor</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Level</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Experience</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {leaderboard.map((u, idx) => {
                    const isUser = String(u._id) === String(profile?._id);
                    return (
                      <tr key={u._id} className={`group transition-colors ${isUser ? 'bg-primary/5' : 'hover:bg-surface-container-high/30'}`}>
                        <td className="px-8 py-6">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                             idx === 0 ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/20' : 
                             idx === 1 ? 'bg-slate-300 text-white' : 
                             idx === 2 ? 'bg-amber-700/60 text-white' : 
                             'text-on-surface-variant'
                           }`}>
                             {idx + 1}
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden border-2 border-outline-variant/10 group-hover:border-primary/20 transition-all">
                              {/* Placeholder Image or Initial */}
                              <span className="text-xs font-black text-on-surface-variant">{u.name.charAt(0)}</span>
                            </div>
                            <div>
                               <p className="text-sm font-black text-on-surface">{u.name} {isUser && <span className="text-[10px] text-primary ml-1">(You)</span>}</p>
                               <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-tighter">Member since {new Date().getFullYear()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[10px] font-black px-3 py-1 bg-surface-container-high rounded-full text-on-surface uppercase tracking-widest border border-outline-variant/10">
                            Lv. {u.level || 1}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex flex-col items-end">
                             <span className="text-sm font-black text-on-surface">{formatCompact(u.xp)}</span>
                             <span className="text-[9px] font-bold text-on-surface-variant uppercase">XP DISCOVERED</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {leaderboard.length === 0 && (
                <div className="py-20 text-center text-on-surface-variant font-medium text-sm">Initiating global standings algorithms...</div>
              )}
            </div>
          </div>
        </section>

      </main>
      
      <BottomNav />
    </div>
  );
}
