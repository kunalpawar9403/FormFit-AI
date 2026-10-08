import app from '../backend/server.js';
import { connectDB } from '../backend/src/config/db.js';

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.warn('[Vercel Serverless] DB connection fallback:', err.message);
    }
  }
  return app(req, res);
}
