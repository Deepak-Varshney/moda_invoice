// lib/config/db.js

import mongoose from 'mongoose';

export default async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // userNewUrlParser:true,
      // useUnifiedTopology: true,
    });
    console.log('DB Connected Success');
  } catch (error) {
    console.error('DB Connection Error: ', error);
  }
}
