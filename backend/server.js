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

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/concerns", concernRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
