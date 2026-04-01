const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
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
      console.log("User created");
    } else {
      normalUser.password = hashedPassword;
      await normalUser.save();
      console.log("User password reset");
    }
    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err);
    process.exit(1);
  }
}
test();
