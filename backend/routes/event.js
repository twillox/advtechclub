const express = require("express");
const router = express.Router();

const Event = require("../models/Event");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// ✅ GET ALL EVENTS
router.get("/", async (req, res) => {
  try {
    const { category, q } = req.query;
    let filter = {};
    if (category && category !== "all") filter.category = category;
    if (q) filter.title = { $regex: q, $options: "i" };

    const events = await Event.find(filter)
      .populate("registeredUsers", "name email level xp")
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error("FETCH EVENTS ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ GET MY REGISTERED EVENTS
router.get("/registered/me", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find({ registeredUsers: req.user.id })
      .populate("registeredUsers", "name email level xp")
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error("GET MY EVENTS ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ CREATE EVENT (Admin Only)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const newEvent = new Event({ ...req.body, createdBy: req.user.id });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ msg: "Failed to create event" });
  }
});

// ✅ REGISTER FOR EVENT
router.post("/:id/register", authMiddleware, async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    const userId = req.user.id;
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    if (!event.registeredUsers) {
      event.registeredUsers = [];
    }

    const alreadyRegistered = event.registeredUsers.some(
      (id) => String(id) === String(userId)
    );

    if (alreadyRegistered) {
      return res.status(400).json({ msg: "Already registered" });
    }

    event.registeredUsers.push(userId);
    await event.save();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Note: XP is now awarded ONLY upon attendance verification, not on registration.


    res.json({
      msg: "Registration successful 🚀",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        department: user.department,
        year: user.year,
        level: user.level,
        xp: user.xp,
        username: user.username
      }
    });

  } catch (err) {
    console.error("💥 REGISTER ERROR FULL:", err);

    res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
});

// ✅ PATCH (UPDATE) EVENT (Admin Only)
router.patch("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const ev = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ev) return res.status(404).json({ msg: "Event not found" });
    res.json(ev);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ DELETE EVENT (Admin Only)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const ev = await Event.findByIdAndDelete(req.params.id);
    if (!ev) return res.status(404).json({ msg: "Event not found" });
    res.json({ msg: "Event removed" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ GET EVENT REGISTRATIONS (Admin Only)
router.get("/:id/registrations", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("registeredUsers", "name level xp email");
    if (!event) return res.status(404).json({ msg: "Event not found" });

    const attendedIds = (event.attendedUsers || []).map(id => String(id));
    const absentIds = (event.absentUsers || []).map(id => String(id));

    const processed = event.registeredUsers.filter(u => u != null).map(u => ({
       _id: u._id,
       name: u.name,
       level: u.level,
       xp: u.xp,
       email: u.email,
       attendanceStatus: attendedIds.includes(String(u._id)) ? "Present" : 
                         absentIds.includes(String(u._id)) ? "Absent" : "Not Marked"
    }));
    res.json({ registrations: processed, isFinalized: event.isFinalized || false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ MARK ATTENDANCE (Admin Only)
router.post("/:id/attend", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, status } = req.body; // status: "Present" | "Absent"
    if (!["Present", "Absent"].includes(status)) {
       return res.status(400).json({ msg: "Invalid status" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });
    if (event.isFinalized) return res.status(400).json({ msg: "Event already finalized" });

    if (!event.attendedUsers) event.attendedUsers = [];
    if (!event.absentUsers) event.absentUsers = [];

    const isCurrentlyPresent = event.attendedUsers.some(id => String(id) === String(userId));
    const isCurrentlyAbsent = event.absentUsers.some(id => String(id) === String(userId));

    if ((status === "Present" && isCurrentlyPresent) || (status === "Absent" && isCurrentlyAbsent)) {
       return res.status(400).json({ msg: `User is already marked ${status}` });
    }

    event.attendedUsers = event.attendedUsers.filter(id => String(id) !== String(userId));
    event.absentUsers = event.absentUsers.filter(id => String(id) !== String(userId));

    if (status === "Present") {
      event.attendedUsers.push(userId);
    } else {
      event.absentUsers.push(userId);
    }

    await event.save();

    // Reward / Adjust XP
    const User = require("../models/User");
    const user = await User.findById(userId);
    if (user) {
      if (status === "Present" && !isCurrentlyPresent) {
         user.xp = (user.xp || 0) + (event.xp || 10);
      } else if (status === "Absent" && isCurrentlyPresent) {
         user.xp = Math.max(0, (user.xp || 0) - (event.xp || 10));
      }
      // Note: pre('save') calculates user.level
      await user.save();
    }

    res.json({ msg: `Attendance marked as ${status}`, status });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ FINALIZE EVENT (Admin Only)
router.post("/:id/finalize", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });
    if (event.isFinalized) return res.status(400).json({ msg: "Already finalized" });

    if (!event.attendedUsers) event.attendedUsers = [];
    if (!event.absentUsers) event.absentUsers = [];

    const attendedIds = event.attendedUsers.map(id => String(id));
    const absentIds = event.absentUsers.map(id => String(id));

    // Mark missing users as Absent
    for (const u of event.registeredUsers) {
       const uId = String(u);
       if (!attendedIds.includes(uId) && !absentIds.includes(uId)) {
          event.absentUsers.push(u);
       }
    }

    event.isFinalized = true;
    await event.save();
    
    res.json({ msg: "Event finalized and unmatched users marked absent" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;