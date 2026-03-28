const express = require("express");
const router = express.Router();
const Concern = require("../models/Concern");
const authMiddleware = require("../middleware/authMiddleware");

const adminMiddleware = require("../middleware/adminMiddleware");

// Create Concern
router.post("/", authMiddleware, async (req, res) => {
  try {
    const concern = new Concern({ 
      ...req.body, 
      user: req.body.isAnonymous ? null : req.user.id 
    });
    await concern.save();
    res.status(201).json(concern);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Get User Concerns
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const concerns = await Concern.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(concerns);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Admin: Get ALL concerns
router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const concerns = await Concern.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(concerns);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Admin: Respond to concern and update status
router.post("/:id/respond", authMiddleware, adminMiddleware, async (req, res) => {
  const { text, status } = req.body;
  try {
    const concern = await Concern.findById(req.params.id);
    if (!concern) return res.status(404).json({ msg: "Not found" });

    if (text) {
      concern.responses.push({ text, adminId: req.user.id });
    }
    if (status) {
      concern.status = status;
    }
    await concern.save();
    res.json(concern);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
