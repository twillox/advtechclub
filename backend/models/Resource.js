const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
      type: String, 
      enum: ["study materials", "project samples", "templates", "recordings"], 
      required: true 
    },
    url: { type: String, required: true }, // link to drive or file
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    downloads: { type: Number, default: 0 }, // track popularity
    requiredRole: { type: String, default: "user", enum: ["user", "admin", "superadmin"] }, // exclusive resources
  },
  { timestamps: true }
);

// Index for search queries
resourceSchema.index({ title: "text", description: "text", category: "text" });

module.exports = mongoose.model("Resource", resourceSchema);
