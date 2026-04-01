const express = require("express");
const router = express.Router();
const Poll = require("../models/Poll");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Admin creates a poll
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const poll = new Poll({ ...req.body, createdBy: req.user.id });
    await poll.save();
    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Get active polls
router.get("/", authMiddleware, async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

const User = require("../models/User");

// User votes on poll
router.post("/:id/vote", authMiddleware, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);
    
    if (poll.voters.includes(req.user.id)) return res.status(400).json({ msg: "Already voted" });
    
    poll.options[optionIndex].votes += 1;
    poll.voters.push(req.user.id);
    
    // Add XP reward to user
    if (poll.xpReward) {
      const user = await User.findById(req.user.id);
      if (user) {
         user.xp = (user.xp || 0) + poll.xpReward;
         user.level = Math.floor(user.xp / 100) + 1;
         await user.save();
      }
    }
    
    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Admin delete poll
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const poll = await Poll.findByIdAndDelete(req.params.id);
    if (!poll) return res.status(404).json({ msg: "Poll not found" });
    res.json({ msg: "Poll deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
