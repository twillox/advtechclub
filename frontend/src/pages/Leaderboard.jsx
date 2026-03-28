import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
    <div className="min-h-screen bg-background text-on-background selection:bg-primary-container px-6 pt-24 pb-24 max-w-md mx-auto">
      <div className="mb-10">
        <span className="text-[10px] uppercase tracking-[0.1em] font-medium text-outline">
          Rankings
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-on-surface">
          Leaderboard
        </h1>
      </div>

      <div className="space-y-3">
        {users.length === 0 ? (
          <div className="text-sm text-on-surface-variant">No data yet.</div>
        ) : (
          users.map((u, idx) => (
            <div
              key={u._id || u.id || `${u.name}-${idx}`}
              className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight text-on-surface">
                    {u.name}
                  </p>
                  <p className="text-[10px] font-medium text-on-surface-variant/60 uppercase tracking-tighter">
                    {u.xp || 0} XP
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/40 text-lg">
                emoji_events
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

