// lib/config/db.js

import mongoose from 'mongoose';

export default async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect("mongodb+srv://deepakvarshneycom:ijBPV8hWJqdGMolr@cluster0.qllt4ki.mongodb.net/invoiceapp/new");
    console.log('DB Connected Success');
  } catch (error) {
    console.error('DB Connection Error: ', error);
  }
}
