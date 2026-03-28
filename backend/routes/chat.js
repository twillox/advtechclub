const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");

// Admin gets all messages related to user
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    }).populate("sender", "name").sort("createdAt");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Admin/Student sends message
router.post("/", authMiddleware, async (req, res) => {
  try {
    const message = new Message({
      sender: req.user.id,
      receiver: req.body.receiver, // ID of admin or student
      text: req.body.text
    });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
