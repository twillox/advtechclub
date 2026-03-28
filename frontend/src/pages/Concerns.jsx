import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Concerns() {
  const [concerns, setConcerns] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", category: "technical issues", isAnonymous: false });

  const [selectedConcern, setSelectedConcern] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const fetchConcerns = async () => {
    try {
      const endpoint = isAdmin ? "/api/concerns/all" : "/api/concerns/me";
      const res = await axios.get(`${API_BASE_URL}${endpoint}`, { headers });
      setConcerns(res.data);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchConcerns(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/concerns`, form, { headers });
      setForm({ title: "", description: "", category: "technical issues", isAnonymous: false });
      fetchConcerns();
      alert("Concern submitted successfully!");
    } catch(err) { alert("Failed to submit"); }
  };

  const handleAdminRespond = async (e) => {
    e.preventDefault();
    if (!selectedConcern) return;
    try {
      await axios.post(`${API_BASE_URL}/api/concerns/${selectedConcern._id}/respond`, {
        text: replyText,
        status: updateStatus
      }, { headers });
      setReplyText("");
      setUpdateStatus("");
      setSelectedConcern(null);
      fetchConcerns();
      alert("Official response sent.");
    } catch(err) { alert("Failed to respond"); }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      <Navbar />
      <main className="pt-24 px-6 max-w-md mx-auto space-y-12">
        <header>
          <h1 className="text-3xl font-bold tracking-tight mb-1">{isAdmin ? "Admin Desk" : "Helpdesk"}</h1>
          <p className="text-sm text-on-surface-variant uppercase tracking-widest font-medium">Issue Management System</p>
        </header>

        {!isAdmin && (
           <form onSubmit={handleSubmit} className="bg-surface-container-lowest p-6 rounded-[32px] shadow-2xl shadow-primary/5 space-y-6">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-l-2 border-primary pl-4">Create New Ticket</h3>
             <label className="block">
                <input required type="text" placeholder="Title" className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-1 focus:ring-primary/20 transition-all text-xs font-bold" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
             </label>
             <label className="block">
                <select className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-1 focus:ring-primary/20 transition-all text-xs font-bold" value={form.category} onChange={e=>setForm({...form, category: e.target.value})}>
                  <option value="technical issues">Technical Issues</option>
                  <option value="suggestions">Suggestions</option>
                  <option value="complaints">Complaints</option>
                  <option value="event ideas">Event Ideas</option>
                  <option value="other">Other</option>
                </select>
             </label>
             <label className="block">
                <textarea required rows="3" placeholder="Context details..." className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-1 focus:ring-primary/20 transition-all text-xs font-bold resize-none" value={form.description} onChange={e=>setForm({...form, description: e.target.value})}></textarea>
             </label>
             <div className="flex items-center gap-3">
               <input type="checkbox" id="anon" checked={form.isAnonymous} onChange={e=>setForm({...form, isAnonymous: e.target.checked})} className="rounded-md text-primary focus:ring-primary bg-surface-container-low border-none w-5 h-5 transition-all" />
               <label htmlFor="anon" className="text-[10px] font-black tracking-widest text-on-surface-variant uppercase grayscale opacity-60">Covert Transevent</label>
             </div>
             <button className="w-full bg-on-surface text-surface rounded-2xl py-4 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl">Deploy Concern</button>
           </form>
        )}

        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-outline border-l-2 border-outline-variant pl-4 mb-8">{isAdmin ? "Active Reports" : "My Transevent History"}</h2>
          {concerns.length === 0 && <p className="text-xs text-outline font-medium text-center py-12 italic opacity-60">System empty.</p>}
          {concerns.map(c => (
            <div key={c._id} 
              onClick={() => isAdmin && setSelectedConcern(c)}
              className={`bg-surface-container-lowest p-6 rounded-[24px] border border-outline-variant/10 shadow-sm transition-all ${isAdmin ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : ''}`}
            >
              <div className="flex justify-between items-center mb-4">
                 <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest border ${c.status === 'Resolved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-primary/5 text-primary border-primary/10'}`}>{c.status}</span>
                 <span className="text-[9px] font-black text-outline opacity-40 uppercase">{c.category}</span>
              </div>
              <h3 className="font-black text-sm tracking-tight text-on-surface">{c.title}</h3>
              <p className="text-[11px] text-on-surface-variant/70 mt-2 line-clamp-2 leading-relaxed">{c.description}</p>
              
              {c.responses.length > 0 && (
                <div className="mt-4 pt-4 border-t border-outline-variant/10 space-y-2">
                   <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Portal Response:</p>
                   <p className="text-[11px] font-medium text-on-surface italic">"{c.responses[c.responses.length-1].text}"</p>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Admin Interaction Panel */}
        {isAdmin && selectedConcern && (
           <div className="fixed inset-0 bg-surface/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
              <div className="bg-surface-container-lowest w-full max-w-sm rounded-[40px] shadow-2xl border border-outline-variant/10 p-10 space-y-8 relative overflow-hidden">
                 <div className="space-y-1">
                    <h3 className="text-xl font-black text-on-surface tracking-tighter uppercase italic">{selectedConcern.title}</h3>
                    <p className="text-[10px] font-black text-on-surface-variant opacity-40 uppercase tracking-widest leading-loose">{selectedConcern.description}</p>
                 </div>
                 
                 <form onSubmit={handleAdminRespond} className="space-y-4">
                    <textarea 
                      required placeholder="Deploy official response..." 
                      className="w-full bg-surface-container-low border-none rounded-3xl p-6 text-xs font-bold focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                      rows="4" value={replyText} onChange={e=>setReplyText(e.target.value)}
                    ></textarea>
                    <select 
                      required className="w-full bg-surface-container-low border-none rounded-2xl p-4 text-xs font-bold focus:ring-1 focus:ring-primary/20 transition-all"
                      value={updateStatus} onChange={e=>setUpdateStatus(e.target.value)}
                    >
                      <option value="">Update Core Status</option>
                      <option value="Pending">Pending</option>
                      <option value="In Review">In Review</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    <div className="flex gap-2">
                       <button type="submit" className="flex-1 bg-primary text-on-primary py-4 rounded-2xl text-[10px] font-black tracking-widest uppercase shadow-xl shadow-primary/10">Commit</button>
                       <button type="button" onClick={()=>setSelectedConcern(null)} className="flex-1 bg-surface-container-highest text-on-surface py-4 rounded-2xl text-[10px] font-black tracking-widest uppercase">Abort</button>
                    </div>
                 </form>
              </div>
           </div>
        )}

      </main>
      <BottomNav />
    </div>
  );
}
