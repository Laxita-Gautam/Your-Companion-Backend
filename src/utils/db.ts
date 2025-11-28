import mongoose from 'mongoose';
import { logger } from './logger';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://laxitagautam20_db_user:v2ZeXG6KmD9meM9K@companion.lumexk6.mongodb.net/?retryWrites=true&w=majority&appName=Companion";

export const connectDB = async () => {
    try{
        await mongoose.connect(MONGODB_URI);
        logger.info("Connected to MongoDB");
    } catch(error){
        logger.error("MongoDB connection error: ",error);
        process.exit(1);
    }
};