const mongoose = require('mongoose');
const Class = require('./models/Class.js'); // Import your Class model
const connectDB = require('./config/db.js'); // Import your DB connection function

connectDB();

const seedClasses = async () => {
  try {
    const classesCount = await Class.countDocuments();
    if (classesCount > 0) {
      console.log('Classes already exist. Skipping seeding.');
      mongoose.connection.close();
      return;
    }

    const classData = [
      { className: 'Pre-Nursery', section: 'A' },
      { className: 'Pre-Nursery', section: 'B' },
      { className: 'Nursery', section: 'A' },
      { className: 'Nursery', section: 'B' },
      { className: 'LKG', section: 'A' },
      { className: 'LKG', section: 'B' },
      { className: 'UKG', section: 'A' },
      { className: 'UKG', section: 'B' },
    ];

    for (let i = 1; i <= 12; i++) {
      classData.push({ className: `${i}`, section: 'A' });
      classData.push({ className: `${i}`, section: 'B' });
    }

    await Class.insertMany(classData);
    console.log('✅ Classes seeded successfully!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding classes:', err);
    mongoose.connection.close();
  }
};

seedClasses();