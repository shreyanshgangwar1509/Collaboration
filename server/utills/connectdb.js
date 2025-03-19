import dotenv from 'dotenv';
import mongoose from "mongoose";
dotenv.config();
export const connectdb = async() => {
    try {
        const respones = await mongoose.connect(process.env.MONGO_URL);
        console.log('database connnected successfully');
        
    } catch (error) {
        console.log('error in connecting database',error);
        
    }
}