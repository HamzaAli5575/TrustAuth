const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      console.log('Admin already exists.');
      process.exit();
    }

    // Create Admin
    const hashedPassword = await bcrypt.hash('123456', 10);
    await User.create({
      username: 'SuperAdmin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin created: admin@test.com / 123456');
    process.exit();
  })
  .catch(err => console.log(err));