const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: [
      {
        text: { type: String, required: true },
        votes: { type: Number, default: 0 },
      }
    ],
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // used to prevent double voting and assign gamification
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deadline: { type: Date, required: true },
    isAnonymous: { type: Boolean, default: true },
    xpReward: { type: Number, default: 5 }, // small participation reward
  },
  { timestamps: true }
);

module.exports = mongoose.model("Poll", pollSchema);
