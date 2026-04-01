const express = require("express");
const router = express.Router();
const Resource = require("../models/Resource");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Admin create resource
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const resource = new Resource({ ...req.body, uploadedBy: req.user.id });
    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Get all resources
router.get("/", authMiddleware, async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Admin delete resource
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ msg: "Resource not found" });
    res.json({ msg: "Resource deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
