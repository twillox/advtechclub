import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", category: "study materials", description: "", url: "" });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/resources`, { headers });
      setResources(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/resources`, form, { headers });
      setForm({ title: "", category: "study materials", description: "", url: "" });
      fetchResources();
      alert("Resources Updated Successfully.");
    } catch (err) {
      console.error(err);
      alert("System Error: Database failed to accept submission.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently remove this resource?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/resources/${id}`, { headers });
      fetchResources();
    } catch (err) { alert("Deletion failed"); }
  };

  const isAdmin = user.role === "admin" || user.role === "superadmin";

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32 font-sans selection:bg-primary/20">
      <Navbar />

      <main className={`pt-24 px-6 ${isAdmin ? 'max-w-5xl' : 'max-w-md'} mx-auto space-y-12`}>
        
        <section className="text-center space-y-2 border-b border-outline-variant/10 pb-8">
           <h1 className="text-4xl font-black tracking-tighter text-on-surface mb-1 uppercase italic">{isAdmin ? "Library Console" : "Resource Hub"}</h1>
           <p className="text-xs text-on-surface-variant tracking-[0.4em] font-black opacity-40 uppercase">{isAdmin ? "Manage Core Knowledge Base" : "Centralized Archive • Version 2.4"}</p>
        </section>

        {isAdmin && (
          <form onSubmit={handleUpload} className="bg-surface-container-lowest p-10 rounded-[48px] shadow-[0px_32px_80px_rgba(45,52,53,0.06)] border border-outline-variant/10 space-y-8 relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <span className="material-symbols-outlined text-9xl">move_to_inbox</span>
             </div>
             
             <div className="relative z-10 flex items-center gap-4 text-primary">
                <span className="material-symbols-outlined font-black">publish</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Publish Material</span>
             </div>

             <div className="space-y-6 relative z-10">
                <input required type="text" placeholder="Title..." className="w-full bg-surface-container-low border-none rounded-2xl py-5 px-6 text-sm font-bold focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-outline/30" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                
                <div className="relative">
                   <select className="w-full bg-surface-container-low border-none rounded-2xl py-5 px-6 text-sm font-bold focus:ring-1 focus:outline-none appearance-none" value={form.category} onChange={e=>setForm({...form, category: e.target.value})}>
                      {["study materials", "project samples", "templates", "recordings"].map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                   </select>
                   <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                </div>

                <textarea required placeholder="Brief digest..." className="w-full bg-surface-container-low border-none rounded-2xl py-5 px-6 text-sm font-bold focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-outline/30 resize-none" rows="3" value={form.description} onChange={e=>setForm({...form, description: e.target.value})}></textarea>
                
                <input required type="url" placeholder="Resource link..." className="w-full bg-surface-container-low border-none rounded-2xl py-5 px-6 text-sm font-bold focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-outline/30" value={form.url} onChange={e=>setForm({...form, url: e.target.value})} />
             </div>

             <button className="w-full bg-on-surface text-surface py-5 rounded-[24px] text-[10px] font-black tracking-[0.4em] uppercase hover:bg-black transition-all shadow-3xl active:scale-95">APPEND TO CORE</button>
          </form>
        )}

        <section className="space-y-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant border-l-4 border-primary pl-6 mb-8">{isAdmin ? "Current Inventory" : "Available Modules"}</h2>
          {loading ? (
             <div className="text-center py-16 text-outline animate-pulse font-black uppercase tracking-widest text-[10px]">Loading...</div>
          ) : resources.length === 0 ? (
            <div className="bg-surface-container-low/20 p-16 rounded-[48px] border border-dashed border-outline-variant/30 text-center text-on-surface-variant flex flex-col items-center gap-4 group hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-4xl opacity-30 group-hover:rotate-12 transition-transform">database_off</span>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Knowledge Base Empty.</p>
            </div>
          ) : (
            resources.map((res) => (
              <div key={res._id} className="bg-surface-container-lowest p-8 rounded-[40px] shadow-[0px_32px_80px_rgba(45,52,53,0.04)] border border-outline-variant/5 group hover:shadow-2xl hover:bg-surface-container-low transition-all">
                <div className="flex justify-between items-start mb-4">
                   <div className="space-y-1">
                     <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{res.category}</span>
                     <h3 className="font-black text-sm tracking-tight text-on-surface uppercase">{res.title}</h3>
                   </div>
                   <div className="flex gap-2">
                      {isAdmin && (
                         <button onClick={()=>handleDelete(res._id)} className="w-10 h-10 rounded-2xl bg-error/5 text-error flex items-center justify-center hover:bg-error transition-all hover:text-white cursor-pointer group/del">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                         </button>
                      )}
                      <a href={res.url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-black transition-all cursor-pointer shadow-lg active:scale-90 no-underline">
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      </a>
                   </div>
                </div>
                <p className="text-xs text-on-surface-variant/70 font-medium leading-relaxed italic opacity-80">{res.description}</p>
              </div>
            ))
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
