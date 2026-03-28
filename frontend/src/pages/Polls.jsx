import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Polls() {
  const [polls, setPolls] = useState([]);
  const [form, setForm] = useState({ question: "", options: ["", ""], xpReward: 5 });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const fetchPolls = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/polls`, { headers });
      setPolls(Array.isArray(res.data) ? res.data : []);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchPolls(); }, []);

  const handleVote = async (pollId, optionIndex) => {
    try {
      await axios.post(`${API_BASE_URL}/api/polls/${pollId}/vote`, { optionIndex }, { headers });
      fetchPolls();
      alert("Voted successfully.");
    } catch(err) { alert(err.response?.data?.msg || "Failed to vote"); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 7); // Default to one week duration

      const payload = { 
        ...form, 
        options: form.options.filter(o => o.trim()).map(o => ({ text: o, votes: 0 })),
        deadline 
      };
      
      await axios.post(`${API_BASE_URL}/api/polls`, payload, { headers });
      setForm({ question: "", options: ["", ""], xpReward: 5 });
      fetchPolls();
      alert("Poll created successfully.");
    } catch(err) { 
      console.error(err);
      alert("Error: Failed to create poll."); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this poll?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/polls/${id}`, { headers });
      fetchPolls();
    } catch(err) { alert("Deletion failed"); }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-40 selection:bg-primary/20 font-sans">
      <Navbar />
      <main className="pt-24 px-6 max-w-md mx-auto space-y-12">
        <header className="mb-8 border-b border-outline-variant/10 pb-8 text-center sm:text-left">
          <h1 className="text-4xl font-black tracking-tighter text-on-surface mb-1 uppercase italic">{isAdmin ? "Consensus Ops" : "Community Polls"}</h1>
          <p className="text-[10px] text-on-surface-variant tracking-[0.4em] uppercase font-black opacity-40">{isAdmin ? "Direct Democratic Steering" : "Shape the collective path"}</p>
        </header>

        {isAdmin && (
           <form onSubmit={handleCreate} className="bg-primary text-on-primary p-10 rounded-[48px] shadow-2xl shadow-primary/20 space-y-6 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-all duration-700 pointer-events-none">
                 <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>ballot</span>
              </div>
              <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                 <span className="material-symbols-outlined text-sm font-black p-2 bg-white/20 rounded-xl">add_chart</span>
                 New Consensus Request
              </h3>
              <div className="space-y-4">
                 <input required type="text" placeholder="The Inquiry..." className="w-full bg-white/10 border-none rounded-2xl py-5 px-6 text-sm font-bold focus:ring-0 focus:outline-none placeholder:text-white/30" value={form.question} onChange={e=>setForm({...form, question: e.target.value})} />
                 <div className="space-y-3">
                    {form.options.map((opt, i) => (
                       <input key={i} required type="text" placeholder={`Option ${i+1}`} className="w-full bg-white/10 border-none rounded-2xl py-4 px-6 text-[11px] font-bold focus:ring-0 focus:outline-none placeholder:text-white/20" value={opt} onChange={e => {
                          const n = [...form.options];
                          n[i] = e.target.value;
                          setForm({...form, options: n});
                       }} />
                    ))}
                    <button type="button" onClick={() => setForm({...form, options: [...form.options, ""]})} className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors cursor-pointer">+ Add Variable</button>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase opacity-60">Reward (XP):</span>
                    <input type="number" className="w-16 bg-white/10 border-none rounded-xl py-2 px-3 text-xs font-bold focus:ring-0" value={form.xpReward} onChange={e=>setForm({...form, xpReward: parseInt(e.target.value) || 0})} />
                 </div>
              </div>
              <button className="w-full bg-white text-primary py-5 rounded-[24px] text-[10px] font-black tracking-[0.2em] uppercase active:scale-95 transition-all shadow-xl">PUBLISH TO NETWORK</button>
           </form>
        )}

        <section className="space-y-8 flex flex-col items-center">
          {polls.length === 0 && <p className="text-xs text-outline font-black text-center py-20 italic opacity-40 uppercase tracking-widest">No active consensus operations.</p>}
          {polls.map((p, pIdx) => {
             const totalVotes = p.options.reduce((acc, curr) => acc + (curr.votes || 0), 0);
             return (
               <div key={p._id} className="w-full bg-surface-container-lowest p-8 rounded-[48px] shadow-[0px_32px_80px_rgba(45,52,53,0.04)] border border-outline-variant/5 space-y-6 relative overflow-hidden group hover:shadow-2xl transition-all">
                  <div className="relative z-10 flex justify-between items-start">
                    <div className="max-w-[80%]">
                      <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2">+{p.xpReward} XP REWARD</p>
                      <h3 className="font-black tracking-tight text-on-surface leading-tight text-xl uppercase italic">{p.question}</h3>
                    </div>
                    {isAdmin && (
                        <button onClick={()=>handleDelete(p._id)} className="w-10 h-10 rounded-2xl bg-error/5 text-error flex items-center justify-center hover:bg-error hover:text-white transition-all outline-none cursor-pointer">
                           <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                    )}
                  </div>
                  
                  <div className="relative z-10 space-y-3 mt-4">
                    {p.options.map((opt, idx) => {
                      const pct = totalVotes ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      return (
                        <div 
                           key={idx} 
                           onClick={()=> !isAdmin && handleVote(p._id, idx)}
                           className={`group/btn relative h-16 w-full ${isAdmin ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'} bg-surface-container-low rounded-2xl overflow-hidden transition-all border border-transparent hover:border-outline-variant/10`}
                        >
                          <div className="absolute left-0 top-0 bottom-0 bg-primary/10 transition-all duration-1000 ease-out" style={{ width: `${pct}%` }}></div>
                          <div className="absolute inset-0 flex items-center justify-between px-6 z-10">
                             <span className="text-[11px] font-black text-on-surface uppercase tracking-tight">{opt.text}</span>
                             <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded italic">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-2 flex justify-center">
                     <p className="text-[9px] font-black text-outline opacity-30 uppercase tracking-[0.3em] italic">{totalVotes} TOTAL RESPONSES</p>
                  </div>
               </div>
             )
          })}
        </section>

      </main>
      <BottomNav />
    </div>
  );
}
