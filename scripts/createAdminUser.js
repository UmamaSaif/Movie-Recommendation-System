const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdminUser() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const existingAdmin = await User.findOne({ email: 'admin@example.com' });
  if (!existingAdmin) {
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'securepassword',
      role: 'admin',
    });
    console.log('Admin user created:', adminUser);
  } else {
    console.log('Admin user already exists');
  }

  mongoose.connection.close();
}

createAdminUser().catch((error) => {
  console.error('Error creating admin user:', error);
});
