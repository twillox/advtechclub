import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/user/leaderboard`);
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setUsers([]);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary-container px-4 md:px-6 pt-24 pb-24 max-w-3xl mx-auto">
      <div className="mb-8">
        <span className="text-[9px] uppercase tracking-[0.1em] font-medium text-outline">
          Rankings
        </span>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-on-surface">
          Leaderboard
        </h1>
      </div>

      <div className="space-y-2 md:space-y-3">
        {users.length === 0 ? (
          <div className="text-sm text-on-surface-variant">No data yet.</div>
        ) : (
          users.map((u, idx) => (
            <div
              key={u._id || u.id || `${u.name}-${idx}`}
              className="bg-surface-container-low p-3 md:p-4 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-[9px] md:text-[10px] font-bold text-on-surface-variant flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm md:text-[15px] font-bold tracking-tight text-on-surface truncate max-w-[200px] md:max-w-none">
                    {u.name}
                  </p>
                  <p className="text-[9px] md:text-[10px] font-medium text-on-surface-variant/60 uppercase tracking-tighter">
                    {u.xp || 0} XP
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/40 text-lg flex-shrink-0">
                emoji_events
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

