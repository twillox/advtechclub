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
  image: {
    type: String,
    default: ""
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
  ],
  absentUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  isFinalized: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
