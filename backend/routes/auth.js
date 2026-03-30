const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// SETUP ADMIN (Temporary backdoor for testing credentials)
router.get("/setup-admin", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    let adminUser = await User.findOne({ email: "admin@university.edu" });

    if (!adminUser) {
      adminUser = new User({
        name: "Admin User",
        email: "admin@university.edu",
        password: hashedPassword,
        role: "admin",
      });
      await adminUser.save();
      return res.json({ msg: "Admin created", email: "admin@university.edu", password: "admin123" });
    } else {
      adminUser.password = hashedPassword;
      await adminUser.save();
      return res.json({ msg: "Admin password reset", email: "admin@university.edu", password: "admin123" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error setting up admin" });
  }
});

// SETUP USER (Temporary backdoor for testing user credentials)
router.get("/setup-user", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash("user123", 10);
    let normalUser = await User.findOne({ email: "user@university.edu" });

    if (!normalUser) {
      normalUser = new User({
        name: "Normal User",
        email: "user@university.edu",
        password: hashedPassword,
        role: "user",
      });
      await normalUser.save();
      return res.json({ msg: "User created", email: "user@university.edu", password: "user123" });
    } else {
      normalUser.password = hashedPassword;
      await normalUser.save();
      return res.json({ msg: "User password reset", email: "user@university.edu", password: "user123" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error setting up user" });
  }
});

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username || null,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
