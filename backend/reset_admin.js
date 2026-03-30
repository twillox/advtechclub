const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String,
    password: String
}, { strict: false });
const User = mongoose.models.User || mongoose.model("User", userSchema);

mongoose.connect('mongodb+srv://tejas:tech123@cluster0.lgue44b.mongodb.net/techclub?retryWrites=true&w=majority')
.then(async () => {
    console.log("Connected to MongoDB.");
    const users = await User.find({}, 'email role name'); // Only fetch email, role, and name
    console.log("Users in the DB:", users);

    if (users.length === 0) {
        console.log("No users found! We need to create an admin user.");
    } else {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Find admin user or first user
        let adminUser = await User.findOne({role: 'admin'});
        if (adminUser) {
           adminUser.password = hashedPassword;
           await adminUser.save();
           console.log("Reset password for admin user:", adminUser.email, "to admin123");
        } else {
           // Make one admin
           adminUser = users[0];
           adminUser.role = "admin";
           adminUser.password = hashedPassword;
           await adminUser.save();
           console.log("Converted user to admin:", adminUser.email, "pass: admin123");
        }
    }
    
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
