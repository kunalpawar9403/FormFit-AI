import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[Database] MONGODB_URI not provided. Operating in safe in-memory fallback mode.');
    return { connected: false, mode: 'memory' };
  }

  if (isConnected) {
    return { connected: true, mode: 'mongodb' };
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Atlas connected: ${conn.connection.host}`);
    return { connected: true, mode: 'mongodb' };
  } catch (error) {
    console.warn(`[Database] MongoDB connection failed (${error.message}). Falling back to memory store.`);
    return { connected: false, mode: 'memory', error: error.message };
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
