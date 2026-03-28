const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

// Get unread notifications
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifs = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Mark as read
router.post("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
