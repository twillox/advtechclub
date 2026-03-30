const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
}, { strict: false });
const User = mongoose.models.User || mongoose.model("User", userSchema);

mongoose.connect('mongodb+srv://tejas:tech123@cluster0.lgue44b.mongodb.net/techclub?retryWrites=true&w=majority')
.then(async () => {
    console.log("Connected");
    const users = await User.find();
    console.log(users);
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
