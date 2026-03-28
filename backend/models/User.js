const mongoose = require("mongoose");
const { computeLevelFromXp } = require("../utils/levels");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "superadmin"],
    },

    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    registeredEvents: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: [] },
    ],
    attendedEvents: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: [] },
    ],

    // 🎖️ Gamification & Badges
    badges: [
      {
        name: String,
        icon: String,
        dateEarned: { type: Date, default: Date.now },
      },
    ],

    // 🎯 Missions Tracker
    completedMissions: [{ type: String }],

    // 👤 Identity & Academic
    username: {
      type: String,
      unique: true,
      sparse: true, // allows null usernames without breaking unique constraint
    },
    department: { type: String, default: "" },
    year: { type: String, default: "" },
    profilePic: { type: String, default: "" },

    // 🧠 Skills & Interests
    skills: [{ type: String }],
    interests: [{ type: String }],

    // 📂 Projects
    projects: [
      {
        title: String,
        description: String,
        link: String,
        status: {
          type: String,
          default: "pending",
          enum: ["pending", "approved", "featured"],
        },
        date: { type: Date, default: Date.now },
      },
    ],

    // 📜 Certificates
    certificates: [
      {
        name: String,
        eventProject: String,
        url: String,
        date: { type: Date, default: Date.now },
      },
    ],

    // 📊 Activity Log
    activityLog: [
      {
        action: String,
        date: { type: Date, default: Date.now },
      },
    ],

    // 🔐 Privacy
    publicVisibility: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 🔄 Auto-update level based on XP
userSchema.pre("save", function (next) {
  this.level = computeLevelFromXp(this.xp);
  next();
});

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);