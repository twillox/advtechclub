const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    
    // Team Collaboration fields
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    requiredTeamSize: { type: Number, default: 1 },
    techStack: [{ type: String }],
    
    // Final Submission fields
    githubLink: { type: String },
    fileUploadUrl: { type: String },
    
    // Admin Review mapping
    status: {
      type: String,
      enum: ["Ideation", "Submitted", "Under Review", "Approved", "Rejected"],
      default: "Ideation",
    },
    scores: {
      technical: { type: Number, min: 0, max: 10 },
      innovation: { type: Number, min: 0, max: 10 },
      presentation: { type: Number, min: 0, max: 10 },
    },
    adminFeedback: { type: String },
    
    // Internal Workspace
    announcements: [
      {
        text: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    internalResources: [
      {
        title: String,
        link: String,
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
      }
    ],
    milestones: [
      {
        title: String,
        completed: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
