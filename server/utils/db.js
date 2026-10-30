import dotenv from 'dotenv';
import mongoose from "mongoose";

dotenv.config();

export const connectdb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
};

export const connectDB = connectdb;
export default connectdb;
