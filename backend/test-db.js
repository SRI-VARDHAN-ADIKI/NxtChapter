import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testConnect = async () => {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
    console.log('Connected successfully with family: 4');
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
};

testConnect();
