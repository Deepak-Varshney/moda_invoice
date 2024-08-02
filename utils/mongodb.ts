import { MongoClient } from 'mongodb';

interface MongoConnection {
  db: import('mongodb').Db;
}

// update uri here
const uri = process.env.MONGODB_URI as string;

const client = new MongoClient(uri);
const clientPromise = client.connect();

// Function to export the connected client
export default async function connectToDatabase(): Promise<MongoConnection> {
  try {
    await clientPromise;
    const db = client.db();
    return { db }; // Return an object with the connected db
  } catch (error) {
    throw new Error('Failed to connect to MongoDB');
  }
}
