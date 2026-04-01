import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Onboarding({ onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    department: "",
    year: "",
    skills: "",
    interests: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      
      // Convert comma-separated strings to arrays
      const payload = {
        ...formData,
        skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
        interests: formData.interests.split(",").map(i => i.trim()).filter(Boolean)
      };

      await axios.put(`${API_BASE_URL}/api/user/profile`, payload, { headers });
      
      // Update local storage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...user, ...payload }));
      
      if (onComplete) onComplete();
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login", { replace: true });
      } else {
        alert(err.response?.data?.msg || "Failed to complete profile");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-surface font-sans">
      <div className="w-full max-w-lg space-y-8">
        
        <header className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-3xl font-black">account_circle</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-on-surface">Complete Your Profile</h1>
          <p className="text-sm font-bold text-on-surface-variant opacity-70">Let's get to know you better</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] shadow-xl border border-outline-variant/10 space-y-6">
          
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-on-surface mb-4">Basic Information</h2>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Username</label>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  placeholder="johndoe"
                />
                <p className="text-xs text-on-surface-variant opacity-60">This will be your unique profile identifier</p>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-primary text-white py-3 rounded-xl text-sm font-bold active:scale-95 transition-all mt-4"
              >
                Next Step
              </button>
            </div>
          )}

          {/* Step 2: Academic Info */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-on-surface mb-4">Academic Details</h2>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  placeholder="Computer Science"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Year of Study</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-surface-container-high text-on-surface py-3 rounded-xl text-sm font-bold active:scale-95 transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-bold active:scale-95 transition-all"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Skills & Interests */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-on-surface mb-4">Skills & Interests</h2>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Skills</label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all resize-none"
                  placeholder="Python, JavaScript, UI/UX Design (comma separated)"
                />
                <p className="text-xs text-on-surface-variant opacity-60">Separate multiple skills with commas</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Interests</label>
                <textarea
                  name="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all resize-none"
                  placeholder="AI/ML, Web Development, Robotics (comma separated)"
                />
                <p className="text-xs text-on-surface-variant opacity-60">Separate multiple interests with commas</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-surface-container-high text-on-surface py-3 rounded-xl text-sm font-bold active:scale-95 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-bold active:scale-95 transition-all disabled:opacity-40"
                >
                  {loading ? "Saving..." : "Complete Setup"}
                </button>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 pt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step ? "bg-primary w-6" : "bg-outline/30"
                }`}
              />
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
