const express = require("express");
const router = express.Router();

const Event = require("../models/Event");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// LIST EVENTS (public)
router.get("/", async (req, res) => {
  try {
    const { q, category } = req.query;
    const filter = {};

    if (category && ["workshop", "hackathon", "seminar"].includes(category)) {
      filter.category = category;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: String(q), $options: "i" } },
        { description: { $regex: String(q), $options: "i" } },
      ];
    }

    const events = await Event.find(filter).sort({ date: 1 }).lean();
    res.json(events);
  } catch (err) {
    console.log("Events Error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET MY REGISTERED EVENTS
router.get("/registered/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("registeredEvents")
      .populate("registeredEvents")
      .lean();

    res.json(user?.registeredEvents || []);
  } catch (err) {
    console.log("My Registered Error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// CREATE EVENT (admin)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, date, xp, category } = req.body;

    if (!title || !date) {
      return res.status(400).json({ msg: "title and date are required" });
    }

    const event = new Event({
      title,
      description,
      date: new Date(date),
      xp: Number(xp) || 0,
      category: category || "workshop",
      createdBy: req.user.id,
    });

    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.log("Create Event Error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// UPDATE EVENT (admin)
router.patch("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updates = {};
    for (const key of ["title", "description", "xp", "category", "date"]) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (updates.date) updates.date = new Date(updates.date);
    if (updates.xp !== undefined) updates.xp = Number(updates.xp) || 0;

    const event = await Event.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!event) return res.status(404).json({ msg: "Event not found" });
    res.json(event);
  } catch (err) {
    console.log("Update Event Error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE EVENT (admin)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });

    await User.updateMany(
      { registeredEvents: event._id },
      { $pull: { registeredEvents: event._id, attendedEvents: event._id } }
    );

    res.json({ msg: "Deleted" });
  } catch (err) {
    console.log("Delete Event Error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// REGISTER FOR EVENT
router.post("/:id/register", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Initialize collections if missing
    if (!user.registeredEvents) user.registeredEvents = [];
    if (!event.registeredUsers) event.registeredUsers = [];

    const already = user.registeredEvents.some((x) => String(x) === String(event._id));
    if (already) return res.status(400).json({ msg: "Already registered for this event" });

    // Add event ID and calculate XP delta
    user.registeredEvents.push(event._id);
    const xpReward = Number(event.xp) || 10;
    user.xp = (user.xp || 0) + xpReward;
    
    // Save user with updated XP
    await user.save();

    if (!event.registeredUsers.some((x) => String(x) === String(user._id))) {
      event.registeredUsers.push(user._id);
      await event.save();
    }

    console.log(`User ${user.email} registered for ${event.title}. +${xpReward} XP awarded.`);
    res.json({ 
      msg: "Registration successful! XP awarded.", 
      xp: user.xp, 
      level: user.level,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        registeredEvents: user.registeredEvents
      }
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ msg: "Failed to register for event", error: err.message });
  }
});

// MARK ATTENDED + AWARD XP (admin)
router.post("/:id/attend", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const already = user.attendedEvents.some((x) => String(x) === String(event._id));
    if (already) return res.status(400).json({ msg: "Already attended" });

    user.attendedEvents.push(event._id);
    user.xp += Number(event.xp) || 0;
    
    // Automatic Badges System
    const badgeName = `Participant: ${event.title}`;
    const hasBadge = user.badges.some(b => b.name === badgeName);
    if (!hasBadge) {
      if (!user.activityLog) user.activityLog = [];
      user.badges.push({
        name: badgeName,
        icon: "event_available",
        dateEarned: new Date()
      });
      user.activityLog.push({ 
        action: `Earned "${badgeName}" badge automatically by attending event`, 
        date: new Date() 
      });
    }

    await user.save();
    
    if (!event.attendedUsers) event.attendedUsers = [];
    if (!event.attendedUsers.includes(user._id)) {
      event.attendedUsers.push(user._id);
      await event.save();
    }

    res.json({ msg: "Attendance recorded and badge awarded if applicable", xp: user.xp, level: user.level, badges: user.badges });
  } catch (err) {
    console.log("Attend Error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// VIEW REGISTRATIONS (admin)
router.get("/:id/registrations", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("registeredUsers", "name email xp level attendedEvents")
      .lean();

    if (!event) return res.status(404).json({ msg: "Event not found" });
    
    // Check if the user has attended this event
    const attendees = (event.registeredUsers || []).map(u => ({
      ...u,
      hasAttended: u.attendedEvents?.some(eId => String(eId) === String(event._id))
    }));

    res.json(attendees);
  } catch (err) {
    console.log("Registrations Error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
