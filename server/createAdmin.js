// const bcrypt = require('bcryptjs');
// const mongoose = require('mongoose');
// const User = require('./models/User.js');
// const Admin = require('./models/Admin.js');
// const connectDB = require('./config/db.js');

// connectDB();

// const createAdmin = async () => {
//   try {
//     const adminEmail = 'admin@school.com'; // Use a consistent email
//     const adminPassword = 'your_new_password_here'; // CHOOSE A NEW PASSWORD

//     // Check if an admin already exists to avoid duplicates
//     const existingAdmin = await User.findOne({ email: adminEmail });
//     if (existingAdmin) {
//       console.log('Admin user already exists. Deleting and recreating for clean slate...');
//       await User.deleteOne({ email: adminEmail });
//       await Admin.deleteOne({ user: existingAdmin._id });
//     }

//     // Hash the new password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(adminPassword, salt);

//     // Create the new user and admin profile
//     const newUser = new User({
//       email: adminEmail,
//       password: hashedPassword,
//       role: 'admin',
//       name: 'System Admin'
//     });
//     await newUser.save();

//     const newAdminProfile = new Admin({
//       user: newUser._id,
//       name: newUser.name
//     });
//     await newAdminProfile.save();

//     console.log('✅ Admin user created successfully!');
//     console.log(`Email: ${adminEmail}`);
//     console.log(`Password: ${adminPassword}`);
//     mongoose.connection.close();
//   } catch (err) {
//     console.error('Error creating admin user:', err);
//     mongoose.connection.close();
//   }
// };

// createAdmin();