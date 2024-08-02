import { ICollection } from '@/types/collection';
import connectToDatabase from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: any, res: any) {
  // Connect to MongoDB database (ideally called once per server startup)

  const { db } = await connectToDatabase();
  const usersCollection = db.collection(ICollection.users);

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      try {
        const users = await usersCollection.find().toArray();
        res.status(200).json(users);
      } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve users' });
      }
      break;

    case 'POST':
      try {
        const newUser = req.body;
        await usersCollection.insertOne(newUser);
        res.status(201).json({ message: 'User created successfully' });
      } catch (error) {
        res.status(400).json({ error: 'Failed to create user' });
      }
      break;

    case 'PUT':
      try {
        const { userId } = req.query; // Assuming ID is passed in the query string
        const updatedUser = req.body;
        await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: updatedUser }
        );
        res.status(200).json({ message: 'User updated successfully' });
      } catch (error) {
        res.status(400).json({ error: 'Failed to update user' });
      }
      break;

    case 'DELETE':
      try {
        const { userId } = req.query; // Assuming ID is passed in the query string
        await usersCollection.deleteOne({ _id: new ObjectId(userId) });
        res.status(200).json({ message: 'User deleted successfully' });
      } catch (error) {
        res.status(400).json({ error: 'Failed to delete user' });
      }
      break;

    default:
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
