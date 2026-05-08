// server/src/config/db.js
const mongoose = require('mongoose');

module.exports = () => {
  const url = process.env.MONGO_URL;
  if (!url) {
    console.error('MONGO_URL not set in .env');
    process.exit(1);
  }
  mongoose.set('strictQuery', false);
  mongoose.connect(url, { dbName: 'smarthealth' })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
      console.error('MongoDB connection error', err);
      process.exit(1);
    });
};
