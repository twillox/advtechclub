import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const fetchProject = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/projects/${id}`, { headers });
      setProject(res.data);
    } catch (err) {
      setError("Failed to load project workspace");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave this team?")) return;
    try {
      await axios.post(`${API_BASE_URL}/api/projects/${id}/leave`, {}, { headers });
      navigate("/projects");
    } catch (err) {
      alert("Failed to leave project");
    }
  };

  const manageRequest = async (uId, action) => {
    try {
      await axios.post(`${API_BASE_URL}/api/projects/${id}/requests/${uId}/${action}`, {}, { headers });
      fetchProject();
    } catch (err) {
      alert(`Failed to ${action} request`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const githubLink = e.target.githubLink.value;
    try {
      await axios.post(`${API_BASE_URL}/api/projects/${id}/submit`, { githubLink }, { headers });
      alert("Project submitted successfully!");
      fetchProject();
    } catch (err) {
      alert("Subevent failed");
    }
  };

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center text-primary font-black uppercase tracking-widest animate-pulse">Loading...</div>;
  if (!project) return <div className="min-h-screen bg-surface flex items-center justify-center text-error font-bold">{error || "Unauthorized access"}</div>;

  const isAdmin = user.role === "admin";
  const uid = String(user._id || user.id);
  const isOwner = String(project.owner._id) === uid || isAdmin;

  const handleReview = async (status) => {
    try {
      await axios.post(`${API_BASE_URL}/api/projects/${id}/review`, { status }, { headers });
      alert(`Project ${status}`);
      fetchProject();
    } catch (err) { alert("Review failed"); }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32 font-sans selection:bg-primary/20">
      <Navbar />
      <main className={`pt-24 px-6 ${isAdmin ? 'max-w-7xl' : 'max-w-4xl'} mx-auto space-y-12`}>
        
        {/* Workspace Header */}
        <header className="space-y-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase text-outline hover:text-primary transition-colors cursor-pointer w-fit mb-2">
             <span className="material-symbols-outlined text-sm">arrow_back</span>
             Back to Project Hub
          </button>
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                {project.status || "In Development"}
             </span>
             <span className="text-[10px] font-medium text-on-surface-variant/40">ID: {id.slice(-6)}</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-on-surface">{project.title}</h1>
          <p className="text-on-surface-variant font-medium leading-relaxed max-w-2xl">{project.description}</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Left: Team Roster */}
          <section className="md:col-span-2 space-y-8">
             <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/10 shadow-[0px_12px_48px_rgba(45,52,53,0.04)] space-y-6">
                <div className="flex justify-between items-center">
                   <h2 className="text-sm font-black uppercase tracking-widest text-on-surface border-l-4 border-primary pl-4">Team Members</h2>
                   {!isOwner && (
                     <button onClick={handleLeave} className="text-[10px] font-black text-error hover:bg-error/5 px-3 py-1 rounded-full transition-colors">LEAVE TEAM</button>
                   )}
                </div>

                <div className="space-y-4">
                  {project.members.map(member => (
                    <div key={member._id} className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-2xl border border-outline-variant/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-black uppercase">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                           <p className="text-sm font-black text-on-surface">{member.name} {member._id === project.owner._id && <span className="ml-2 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full">OWNER</span>}</p>
                           <p className="text-[10px] font-medium text-on-surface-variant">LV. {member.level} CONTRIBUTOR</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-outline text-sm">verified</span>
                    </div>
                  ))}
                </div>
             </div>

             {/* Owner Only: Pending Requests */}
             {isOwner && (
               <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/10 shadow-[0px_12px_48px_rgba(45,52,53,0.04)] space-y-6">
                 <h2 className="text-sm font-black uppercase tracking-widest text-on-surface border-l-4 border-rose-500 pl-4">Join Requests ({project.joinRequests.length})</h2>
                 <div className="space-y-4">
                   {project.joinRequests.length === 0 && <p className="text-xs text-on-surface-variant/60 font-medium py-4">No active connection attempts.</p>}
                   {project.joinRequests.map(req => (
                     <div key={req._id} className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-black uppercase">
                            {req.name.charAt(0)}
                          </div>
                          <div>
                             <p className="text-sm font-black text-on-surface">{req.name}</p>
                             <p className="text-[10px] font-medium text-on-surface-variant">{req.xp} XP • LV. {req.level}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => manageRequest(req._id, 'approve')} className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center active:scale-90 transition-transform"><span className="material-symbols-outlined text-sm font-black">check</span></button>
                           <button onClick={() => manageRequest(req._id, 'reject')} className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center active:scale-90 transition-transform"><span className="material-symbols-outlined text-sm font-black">close</span></button>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </section>

          {/* Right: Controls / Subevent */}
          <aside className="space-y-8">
             <div className="bg-primary text-on-primary p-8 rounded-[32px] shadow-2xl shadow-primary/20 space-y-6">
                <h3 className="text-sm font-black uppercase tracking-[0.2em]">Project Status</h3>
                <div className="space-y-1">
                   <p className="text-3xl font-black tracking-tight">{project.status || "Active"}</p>
                   <p className="text-xs font-medium opacity-70">Review will begin post-subevent</p>
                </div>
                
                {isOwner && project.status !== "Submitted" && (
                  <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-80">Final Github Link</label>
                       <input 
                         name="githubLink"
                         type="url" required placeholder="https://github.com/..."
                         className="w-full bg-white/10 border-none rounded-xl p-4 text-xs font-bold focus:ring-0 focus:outline-none placeholder:text-white/30"
                         defaultValue={project.githubLink || ""}
                       />
                     </div>
                     <button className="w-full bg-white text-primary py-4 rounded-xl text-xs font-black tracking-widest uppercase hover:bg-opacity-90 transition-all active:scale-95 shadow-xl">
                        SUBMIT FINAL WORK
                     </button>
                  </form>
                )}

                {project.githubLink && (
                   <div className="pt-4 border-t border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Submitted Link</p>
                      <a href={project.githubLink} target="_blank" rel="noreferrer" className="text-xs font-black underline truncate block">{project.githubLink}</a>
                   </div>
                 )}

                 {isAdmin && project.status === "Submitted" && (
                    <div className="pt-6 border-t border-white/10 space-y-4">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-60">ADMIN ACTION REQ</p>
                       <div className="flex gap-2">
                          <button onClick={() => handleReview("Approved")} className="flex-1 bg-green-500 text-white py-3 rounded-xl text-[10px] font-black tracking-widest uppercase active:scale-95 shadow-lg">APPROVE</button>
                          <button onClick={() => handleReview("Rejected")} className="flex-1 bg-rose-500 text-white py-3 rounded-xl text-[10px] font-black tracking-widest uppercase active:scale-95 shadow-lg">REJECT</button>
                       </div>
                    </div>
                 )}
              </div>

             {/* Activity Placeholder */}
             <div className="bg-surface-container-lowest p-6 rounded-[32px] border border-outline-variant/10 shadow-sm space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">System Logs</h4>
                <div className="space-y-3 opacity-60">
                   <div className="text-[10px] font-medium">• Workspace initialized</div>
                   <div className="text-[10px] font-medium">• Team roster updated</div>
                   <div className="text-[10px] font-medium">• Secure connection enabled</div>
                </div>
             </div>
          </aside>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
