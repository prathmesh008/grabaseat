// require('dotenv').config({ path: '../.env' });
// const mongoose = require('mongoose');
// const User = require('./model/user.model');
// const Role = require('./model/role.model');

// async function checkUser() {
//     console.log("Checking User in DB...");
//     console.log("URI:", process.env.ATLAS_URI ? "Found" : "Missing");

//     try {
//         await mongoose.connect(process.env.ATLAS_URI);
//         console.log("Connected to MongoDB Atlas.");

//         // List all users to see what's there
//         const users = await User.find({});
//         console.log(`Found ${users.length} users in the database.`);
//         users.forEach(u => console.log(` - ${u.email} (${u.name})`));

//         // specific check
//         // const emailToCheck = "ai@test.com"; // default
//         // const specific = await User.findOne({ email: emailToCheck });
//         // console.log(`Specific check for ${emailToCheck}:`, specific ? "Found" : "Not Found");

//     } catch (err) {
//         console.error("Error:", err);
//     } finally {
//         await mongoose.connection.close();
//     }
// }

// checkUser();
