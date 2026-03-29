import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import EventCard from "../components/EventCard";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token");
}

function logout(navigate) {
  localStorage.clear();
  navigate("/login", { replace: true });
}

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(null);
  
  // Admin Management State
  const [managingEvent, setManagingEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState({});

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const headers = useMemo(() => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/events?`;
      if (category !== "all") url += `category=${category}&`;
      if (query) url += `q=${query}&`;

      const res = await axios.get(url, { headers });
      if (Array.isArray(res.data)) {
        setEvents(res.data);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        logout(navigate);
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceLoad = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(delayDebounceLoad);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, query, headers]);

  const handleRegister = async (eventId) => {
    setRegistering(eventId);
    try {
      await axios.post(`${API_BASE_URL}/api/events/${eventId}/register`, {}, { headers });
      
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        if (!u.registeredEvents) u.registeredEvents = [];
        u.registeredEvents.push(eventId);
        localStorage.setItem("user", JSON.stringify(u));
      }

      setEvents((prev) =>
        prev.map((e) => {
          if (e._id === eventId) {
            return {
              ...e,
              registeredUsers: [...e.registeredUsers, "me"], 
            };
          }
          return e;
        })
      );
      
      alert("Registration successful! XP Awarded.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to register");
    } finally {
      setRegistering(null);
    }
  };

  const getIsRegistered = (ev) => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      if (!u || !u._id) return false;
      const uid = u._id || u.id;
      return (ev.registeredUsers || []).some(
        (userId) => String(userId) === String(uid) || userId === "me"
      );
    } catch {
      return false;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently remove this event?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/events/${id}`, { headers });
      setEvents(prev => prev.filter(e => e._id !== id));
      alert("Event decomevented.");
    } catch (err) { alert("Deletion failed"); }
  };

  const handleManage = async (ev) => {
    setManagingEvent(ev);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/events/${ev._id}/registrations`, { headers });
      setAttendees(res.data);
    } catch (err) { alert("Database failure"); }
  };

  const handleMarkAttendance = async (userId) => {
     try {
        await axios.post(`${API_BASE_URL}/api/events/${managingEvent._id}/attend`, { userId }, { headers });
        alert("Attendance Authenticated. XP Synchronized.");
        handleManage(managingEvent); // Refresh
     } catch (err) { alert(err.response?.data?.msg || "Sync failed"); }
  };

  const handleAwardBadge = async (userId) => {
     const badgeName = prompt("Medal Title (e.g. Master Architect)");
     if (!badgeName) return;
     try {
        await axios.post(`${API_BASE_URL}/api/user/award-badge-manual`, { userId, badgeName }, { headers });
        alert("Merit Recognized. Badge deployed.");
     } catch (err) { alert("Issuance failed"); }
  };

  const handleEdit = (ev) => {
     setEditingEvent(ev);
     setEditForm({ ...ev, date: new Date(ev.date).toISOString().slice(0, 16) });
  };

  const handleUpdateEvent = async (e) => {
     e.preventDefault();
     try {
        await axios.patch(`${API_BASE_URL}/api/events/${editingEvent._id}`, editForm, { headers });
        setEditingEvent(null);
        fetchEvents();
        alert("Event updated.");
     } catch (err) { alert("Update failed"); }
  };

  return (
    <div className="bg-background text-on-background min-h-screen pb-32">
      <Navbar />

      <main className={`pt-24 pb-32 px-6 ${isAdmin ? 'max-w-5xl' : 'max-w-md'} mx-auto min-h-screen`}>
        
        {/* Header */}
        <section className="mb-12">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.1em] font-medium text-outline">Curated for you</span>
            <h1 className="text-3xl font-semibold tracking-tight text-on-surface">Explore Events</h1>
          </div>
        </section>

        {/* Search & Filter Minimal */}
        <section className="mb-10">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline text-[20px]">search</span>
            </div>
            <input 
              id="events-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search technical meetups..."
              className="w-full bg-surface-container-lowest border-none rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-1 focus:ring-outline/20 shadow-[0px_2px_8px_rgba(45,52,53,0.02)] transition-all"
            />
          </div>
          
          <div className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar py-1">
            {["all", "workshop", "hackathon", "seminar"].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-transform active:scale-95 ${
                  category === c 
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                }`}
              >
                {c === "all" ? "All Events" : c.charAt(0).toUpperCase() + c.slice(1) + "s"}
              </button>
            ))}
          </div>
        </section>

        {/* Recommended AI Section */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
              <h2 className="text-xs uppercase tracking-widest font-bold text-on-surface/40">AI Suggestions</h2>
              <span className="text-[10px] font-semibold text-primary">View All</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="text-sm text-outline py-12 text-center bg-surface-container-lowest rounded-2xl">
                 Loading...
              </div>
            ) : events.length === 0 ? (
              <div className="text-sm text-outline py-8 text-center bg-surface-container-lowest rounded-2xl">
                 No events found matching your criteria.
              </div>
            ) : (
              events.map((ev) => (
                <EventCard
                  key={ev._id}
                  ev={ev}
                  isReg={getIsRegistered(ev)}
                  registering={registering}
                  onRegister={handleRegister}
                  onDelete={handleDelete}
                  onManage={handleManage}
                  onEdit={handleEdit}
                />
              ))
            )}
          </div>
        </section>

        {/* Vertical Timeline Discovery */}
        <section className="mb-8">
            <h2 className="text-xs uppercase tracking-widest font-bold text-on-surface/40 mb-8">Upcoming Stream</h2>
            <div className="relative pl-8 flex flex-col gap-10">
                <div className="absolute left-[3px] top-2 bottom-0 w-[1px] bg-outline-variant/20"></div>

                <div className="relative group cursor-pointer opacity-80 hover:opacity-100">
                    <div className="absolute -left-[33px] top-1.5 w-2.5 h-2.5 rounded-full bg-outline-variant border-4 border-background transition-all"></div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-outline-variant tracking-tighter">OCT 15 • 10:00</span>
                            <span className="material-symbols-outlined text-outline text-[16px]">expand_more</span>
                        </div>
                        <h4 className="text-base font-semibold text-on-surface tracking-tight">AI Prompt Engineering Lab</h4>
                        <p className="text-[11px] text-on-surface-variant/70 mt-1">Workshop by Google Labs architects.</p>
                    </div>
                </div>

                <div className="relative group cursor-pointer opacity-80 hover:opacity-100">
                    <div className="absolute -left-[33px] top-1.5 w-2.5 h-2.5 rounded-full bg-outline-variant border-4 border-background transition-all"></div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-outline-variant tracking-tighter">OCT 18 • 19:30</span>
                            <span className="material-symbols-outlined text-outline text-[16px]">expand_more</span>
                        </div>
                        <h4 className="text-base font-semibold text-on-surface tracking-tight">Algorithm Speed Dating</h4>
                        <p className="text-[11px] text-on-surface-variant/70 mt-1">Quick-fire pair programming sessions.</p>
                    </div>
                </div>
            </div>
        </section>

      </main>

      <BottomNav />

      {/* Attendee Management Modal */}
      {managingEvent && (
         <div className="fixed inset-0 bg-surface/80 backdrop-blur-2xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[48px] shadow-3xl w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden border border-outline-variant/10">
               <div className="bg-primary p-10 text-on-primary">
                  <div className="flex justify-between items-start">
                     <div>
                        <h3 className="text-2xl font-black tracking-tighter uppercase italic">{managingEvent.title}</h3>
                        <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mt-1">Manage Attendees</p>
                     </div>
                     <button onClick={() => setManagingEvent(null)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all cursor-pointer">
                        <span className="material-symbols-outlined font-black">close</span>
                     </button>
                  </div>
               </div>

               <div className="p-10 overflow-y-auto flex-1 space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-outline italic opacity-40">Registered Users ({attendees.length})</h4>
                  <div className="space-y-4">
                     {attendees.map(a => (
                        <div key={a._id} className="bg-surface-container-low p-6 rounded-3xl flex justify-between items-center group hover:bg-surface-container-high transition-all border border-outline-variant/5">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-white shadow-inner flex items-center justify-center font-black text-primary border border-outline-variant/10 uppercase">
                                 {a.name.charAt(0)}
                              </div>
                              <div>
                                 <p className="text-sm font-black text-on-surface uppercase tracking-tight italic">{a.name}</p>
                                 <p className="text-[9px] font-bold text-outline uppercase tracking-wider">Level {a.level} ({a.xp} XP)</p>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              {a.hasAttended ? (
                                <span className="px-4 py-2 bg-surface-dim text-outline rounded-xl text-[9px] font-black uppercase tracking-widest opacity-50 cursor-not-allowed flex items-center justify-center">
                                   Present ✓
                                </span>
                              ) : (
                                <button 
                                   onClick={() => handleMarkAttendance(a._id)}
                                   className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all cursor-pointer"
                                >
                                   Mark Present
                                </button>
                              )}
                              <button 
                                 onClick={() => handleAwardBadge(a._id)}
                                 className="px-4 py-2 bg-secondary/10 text-secondary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-all cursor-pointer"
                              >
                                 Issue Badge
                              </button>
                           </div>
                        </div>
                     ))}
                     {attendees.length === 0 && <p className="text-center py-10 italic text-outline opacity-40 text-xs font-black uppercase tracking-widest">No users registered.</p>}
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
         <div className="fixed inset-0 bg-surface/80 backdrop-blur-2xl z-[100] flex items-center justify-center p-6 animate-in zoom-in duration-300">
            <form onSubmit={handleUpdateEvent} className="bg-white rounded-[48px] shadow-3xl w-full max-w-lg p-10 space-y-8 border border-outline-variant/10">
               <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">Edit Event</h3>
                  <button type="button" onClick={() => setEditingEvent(null)} className="p-3 bg-surface-container-low rounded-2xl hover:bg-surface-container-high transition-all cursor-pointer">
                     <span className="material-symbols-outlined font-black">close</span>
                  </button>
               </div>

               <div className="space-y-4">
                  <input required placeholder="Title" className="w-full bg-surface-container-low p-5 rounded-2xl border-none font-bold text-sm focus:ring-1" value={editForm.title} onChange={e=>setEditForm({...editForm, title:e.target.value})} />
                  <textarea rows="3" placeholder="Description" className="w-full bg-surface-container-low p-5 rounded-2xl border-none font-bold text-xs focus:ring-1" value={editForm.description} onChange={e=>setEditForm({...editForm, description:e.target.value})}></textarea>
                  <div className="grid grid-cols-2 gap-4">
                     <input type="datetime-local" className="bg-surface-container-low p-4 rounded-xl border-none font-bold text-xs" value={editForm.date} onChange={e=>setEditForm({...editForm, date:e.target.value})} />
                     <input type="number" placeholder="XP" className="bg-surface-container-low p-4 rounded-xl border-none font-bold text-xs" value={editForm.xp} onChange={e=>setEditForm({...editForm, xp:e.target.value})} />
                  </div>
                  <select className="w-full bg-surface-container-low p-4 rounded-xl border-none font-bold text-xs" value={editForm.category} onChange={e=>setEditForm({...editForm, category:e.target.value})}>
                     <option value="workshop">Workshop</option>
                     <option value="hackathon">Hackathon</option>
                     <option value="seminar">Seminar</option>
                  </select>
               </div>

               <button className="w-full bg-secondary text-white py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95 cursor-pointer">Sync Parameters</button>
            </form>
         </div>
      )}
    </div>
  );
}
