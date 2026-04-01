const express = require("express");
const router = express.Router();

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// GET PROFILE
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    
    // Calculate rank
    const rank = await User.countDocuments({ xp: { $gt: user.xp } }) + 1;
    const userData = user.toObject();
    userData.rank = rank;
    
    res.json(userData);
  } catch (err) {
    console.log("Profile Error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET LEADERBOARD (Top Users by XP)
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find().select("name xp level").sort({ xp: -1 }).limit(10);
    res.json(users);
  } catch (err) {
    console.log("Leaderboard Error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET STATS (Admin only)
router.get("/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({ totalUsers });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// UPDATE PROFILE
router.put("/profile", authMiddleware, async (req, res) => {
  try {
     const { name, department, year, profilePic, skills, interests, publicVisibility, username } = req.body;
     
     // Enforce that username is not empty to avoid MongoDB sparse index issues!
     if (!username || username.trim() === "") {
        return res.status(400).json({ msg: "Username is required to complete onboarding." });
     }
     
     if (!name || name.trim() === "") {
        return res.status(400).json({ msg: "Name is required." });
     }

     const existing = await User.findOne({ username, _id: { $ne: req.user.id } });
     if (existing) return res.status(400).json({ msg: "Mission handle (username) already claimed." });

     const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { name, department, year, profilePic, skills, interests, publicVisibility, username } },
        { new: true }
     ).select("-password");
     
     res.json(user);
  } catch (err) {
     console.error(err);
     res.status(500).json({ msg: "Regsitry update failed" });
  }
});

// GET PUBLIC PROFILE BY USERNAME
router.get("/public/:username", async (req, res) => {
  try {
     const user = await User.findOne({ username: req.params.username, publicVisibility: true })
        .select("name department year profilePic skills interests projects badges xp level");
     
     if (!user) return res.status(404).json({ msg: "Identity not found or private." });
     res.json(user);
  } catch (err) {
     res.status(500).json({ msg: "Identity retrieval failure" });
  }
});

// ADD XP (Admin only)
router.post("/add-xp", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, xp, action } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.xp += Number(xp) || 0;
    if (action) {
       user.activityLog.push({ action, date: new Date() });
    }
    await user.save();

    res.json({ msg: "XP updated", xp: user.xp, level: user.level });
  } catch (err) {
    console.log("XP Error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// AWARD BADGE (Admin only)
router.post("/award-badge-manual", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, badgeName, badgeIcon } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "Operative not found" });

    user.badges.push({
      name: badgeName || "Commendation",
      icon: badgeIcon || "workspace_premium",
      dateEarned: new Date()
    });
    
    user.activityLog.push({ 
       action: `Awarded "${badgeName}" badge by council override`, 
       date: new Date() 
    });

    await user.save();
    res.json({ msg: "Badge awarded successfully", badges: user.badges });
  } catch (err) {
    res.status(500).json({ msg: "Badge issuance protocol failed" });
  }
});

const DataExport = require("../models/DataExport");

// GET DATA EXPORT WARNINGS (Admin only)
router.get("/data-warnings", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const warnings = await DataExport.find().sort({ createdAt: -1 }).limit(1);
    res.json(warnings);
  } catch (err) {
    res.status(500).json({ msg: "Backup fetch failed" });
  }
});

module.exports = router;

