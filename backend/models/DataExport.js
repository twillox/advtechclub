const mongoose = require("mongoose");

const dataExportSchema = new mongoose.Schema({
  type: { type: String, default: "Auto Backup" },
  downloadUrl: { type: String, required: true },
  readyForDownload: { type: Boolean, default: true },
  deletionDate: { type: Date, required: true }, // The date when the actual data will be lost (TTL triggering)
  warningMessage: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("DataExport", dataExportSchema);
