import mongoose from "mongoose";

const nodeEnv = process.env.NODE_ENV || 'development';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        if (nodeEnv === 'development') {
            console.log("Connected to MongoDB");
        }
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        process.exit(1);
    }
};