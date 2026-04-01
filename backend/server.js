const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const eventRoutes = require("./routes/event");
const concernRoutes = require("./routes/concern");
const resourceRoutes = require("./routes/resource");
const projectRoutes = require("./routes/project");
const pollRoutes = require("./routes/poll");
const chatRoutes = require("./routes/chat");
const notificationRoutes = require("./routes/notification");

// Initialize Data Lifecycle Cron Jobs
require("./utils/cronJobs");

const app = express();

// Enhanced CORS for production
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Public Files (Backups/Data Sheets)
const path = require("path");
app.use("/backups", express.static(path.join(__dirname, "public", "backups")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/concerns", concernRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check route for Render
app.get("/", (req, res) => {
  res.json({ msg: "TechClub Portal API is running", status: "healthy" });
});

// MongoDB Connection with better error handling
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
