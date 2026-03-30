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

    const events = await Event.find(filter).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error("FETCH EVENTS ERROR:", err);
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

    user.xp = (user.xp || 0) + (event.xp || 10);
    user.level = Math.floor(user.xp / 100) + 1;

    await user.save();

    res.json({
      msg: "Registration successful 🚀",
      user,
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

    // Format the response according to what Events.jsx needs: map attended state
    const attendedIds = (event.attendedUsers || []).map(id => String(id));
    const processed = event.registeredUsers.map(u => ({
       _id: u._id,
       name: u.name,
       level: u.level,
       xp: u.xp,
       email: u.email,
       hasAttended: attendedIds.includes(String(u._id))
    }));
    res.json(processed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ MARK ATTENDANCE (Admin Only)
router.post("/:id/attend", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });

    if (!event.attendedUsers) event.attendedUsers = [];
    if (event.attendedUsers.some(id => String(id) === String(userId))) {
       return res.status(400).json({ msg: "Already attended" });
    }

    event.attendedUsers.push(userId);
    await event.save();

    // Bonus XP for physically attending
    const user = await User.findById(userId);
    if (user) {
      user.xp = (user.xp || 0) + 20; // Bonus XP
      user.level = Math.floor(user.xp / 100) + 1;
      await user.save();
    }

    res.json({ msg: "Attendance marked successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;