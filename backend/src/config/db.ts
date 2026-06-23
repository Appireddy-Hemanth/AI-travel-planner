import mongoose from 'mongoose';

let mongoServer: any = null;

const connectDB = async (): Promise<void> => {
  try {
    let uri = process.env.MONGO_URI as string;

    // If no external MongoDB URI is provided, start in-memory server
    if (!uri) {
      console.log('Starting in-memory MongoDB server...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log('In-memory MongoDB started');
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const err = error as Error;
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
