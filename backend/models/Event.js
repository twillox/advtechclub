const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  date: { type: Date, required: true },
  xp: {
    type: Number,
    default: 10
  },
  category: {
    type: String,
    enum: ["workshop", "hackathon", "seminar"],
    default: "workshop"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  registeredUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  attendedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
