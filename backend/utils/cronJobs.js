const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv");
const Notification = require("../models/Notification");
const Concern = require("../models/Concern");
const DataExport = require("../models/DataExport");

const backupRoutine = async () => {
   try {
     console.log("Running Daily Cron: Checking for expiring data...");

     // Target: Data 28 days old (MongoDB TTL deletes at 30 days)
     const cutoffDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
     
     const expiringNotifs = await Notification.find({ createdAt: { $lte: cutoffDate } }).lean();
     // If we also want to sweep anything else, we can do it here.

     if (expiringNotifs.length > 0) {
        console.log(`Found ${expiringNotifs.length} records expiring soon. Exporting...`);
        
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(expiringNotifs);
        
        const backupDir = path.join(__dirname, "../public/backups");
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
        
        const fileName = `autoBackup_${Date.now()}.csv`;
        fs.writeFileSync(path.join(backupDir, fileName), csv);
        
        const deletionDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

        await DataExport.create({
           downloadUrl: `/backups/${fileName}`,
           readyForDownload: true,
           deletionDate,
           warningMessage: `CRITICAL: System will auto-delete ${expiringNotifs.length} records in 2 days to maintain storage limits. Please download the generated CSV sheet.`
        });
     }
   } catch (err) {
     console.error("Cron Job Backup Failed:", err);
   }
};

// Run daily at midnight
cron.schedule("0 0 * * *", backupRoutine);

module.exports = { backupRoutine };
