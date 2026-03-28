import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  // Assuming 1-to-1 with a generic Admin. In a real scenario we select the admin.
  // We'll just POST it without receiver to global inbox or let the backend handle.
  
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const fetchMessages = async () => {
    // Basic mock fetch for MVP
    try {
      const res = await axios.get(`${API_BASE_URL}/api/chat/${user._id || "admin"}`, { headers });
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text) return;
    try {
      await axios.post(`${API_BASE_URL}/api/chat`, { text, receiver: user._id }, { headers }); // Mock receiver
      setText("");
      fetchMessages();
    } catch(err) { alert("Failed to send message"); }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32 flex flex-col">
      <Navbar />
      <main className="pt-24 px-6 max-w-md mx-auto flex-1 flex flex-col w-full h-[calc(100vh-100px)]">
        <header className="flex-none mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Support</h1>
          <p className="text-sm text-on-surface-variant uppercase tracking-widest font-medium">1-to-1 Operator Chat</p>
        </header>

        <section className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 hide-scrollbar">
          {messages.length === 0 && <div className="text-center text-outline text-sm mt-12 py-12 bg-surface-container-lowest rounded-2xl">Start a secure conversation...</div>}
          
          {messages.map(m => {
            const isMe = m.sender._id === user._id || m.sender === user._id;
            return (
              <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                  isMe ? 'bg-primary text-on-primary rounded-br-none' : 'bg-surface-container-high text-on-surface rounded-bl-none shadow-[0px_4px_12px_rgba(0,0,0,0.03)]'
                }`}>
                  {m.text}
                </div>
              </div>
            )
          })}
        </section>

        <form onSubmit={handleSend} className="flex-none flex items-center gap-2 bg-surface-container-lowest p-2 rounded-full border border-outline-variant/20 shadow-[0px_8px_24px_rgba(0,0,0,0.04)]">
          <input 
            type="text" 
            placeholder="Type your message..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 outline-none"
            value={text} 
            onChange={e=>setText(e.target.value)}
          />
          <button className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-90 transition-transform cursor-pointer border-none outline-none flex-none">
            <span className="material-symbols-outlined text-sm font-bold">send</span>
          </button>
        </form>
      </main>
      <BottomNav />
    </div>
  );
}
