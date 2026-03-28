const mongoose = require("mongoose");

const concernSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
      type: String, 
      enum: ["technical issues", "suggestions", "complaints", "event ideas", "other"],
      required: true 
    },
    // Optional because it can be anonymous
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isAnonymous: { type: Boolean, default: false },
    status: { 
      type: String, 
      enum: ["Pending", "In Review", "Resolved"], 
      default: "Pending" 
    },
    escalated: { type: Boolean, default: false }, // escalate flag for serious issues
    responses: [
      {
        text: String,
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Concern", concernSchema);
