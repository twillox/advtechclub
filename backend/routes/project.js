const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Create Project (Collab/Submission)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const project = new Project({ ...req.body, owner: req.user.id, members: [req.user.id] });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});
// Get all projects via Query
router.get("/", authMiddleware, async (req, res) => {
  try {
    const filter = req.query.mine === "true" ? { members: req.user.id } : {};
    const projects = await Project.find(filter).populate("owner members joinRequests", "name email");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Get Single Project
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner members joinRequests", "name email xp level");
    if (!project) return res.status(404).json({ msg: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Request to join team
router.post("/:id/join", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: "Project not found" });
    
    const isMember = project.members.some(m => m.toString() === req.user.id);
    const isPending = project.joinRequests.some(r => r.toString() === req.user.id);
    
    if (!isMember && !isPending) {
      project.joinRequests.push(req.user.id);
      await project.save();
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Leave Project
router.post("/:id/leave", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    // Remove from members
    project.members = project.members.filter(m => m.toString() !== req.user.id);
    
    // If owner leaves, assign a new one or set as empty (safety)
    if (project.owner.toString() === req.user.id) {
       if (project.members.length > 0) {
         project.owner = project.members[0];
       } else {
         // Project might need to be archived or deleted if no one left
         await Project.findByIdAndDelete(req.params.id);
         return res.json({ msg: "Project deleted as last member left" });
       }
    }
    
    await project.save();
    res.json({ msg: "Left project" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Approve Request (Owner only)
router.post("/:id/requests/:userId/approve", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ msg: "Not authorized" });

    const userId = req.params.userId;
    project.joinRequests = project.joinRequests.filter(r => r.toString() !== userId);
    
    if (!project.members.some(m => m.toString() === userId)) {
      project.members.push(userId);
    }
    
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Reject Request (Owner only)
router.post("/:id/requests/:userId/reject", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ msg: "Not authorized" });

    const userId = req.params.userId;
    project.joinRequests = project.joinRequests.filter(r => r.toString() !== userId);
    
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Submit final project for review
router.post("/:id/submit", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project.owner.toString() !== req.user.id && req.user.role !== "admin") return res.status(403).json({ msg: "Not authorized" });
    
    project.status = "Submitted";
    project.githubLink = req.body.githubLink;
    project.fileUploadUrl = req.body.fileUploadUrl;
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Admin Review
router.post("/:id/review", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    project.status = req.body.status; // Approved, Rejected
    project.scores = req.body.scores;
    project.adminFeedback = req.body.adminFeedback;
    // Add gamification XP logic here if approved
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
