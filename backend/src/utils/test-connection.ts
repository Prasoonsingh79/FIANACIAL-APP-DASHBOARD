import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
  console.log('Testing connection to:', process.env.MONGO_URI?.replace(/:([^@]+)@/, ':****@'));
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('✅ Connection Successful!');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Connection Failed!');
    console.error('Error Code:', err.code);
    console.error('Full Error:', err.message);
    process.exit(1);
  }
};

test();
