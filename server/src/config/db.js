import mongoose from "mongoose";

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.warn(
            "MONGO_URI not set. Using in-memory game storage."
        );

        return false;
    }

    try {
        const connection = await mongoose.connect(
            process.env.MONGO_URI,
            {
                serverSelectionTimeoutMS: 3000,
            }
        );

        console.log(
            `MongoDB Connected: ${connection.connection.host}`
        );

        return true;
    } catch (error) {
        console.warn(
            "MongoDB unavailable. Using in-memory game storage:",
            error.message
        );

        return false;
    }
};

export default connectDB;
