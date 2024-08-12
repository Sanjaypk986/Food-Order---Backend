import mongoose from "mongoose";
import 'dotenv/config'

export const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.CONNECTION_STRING)
        console.log("Database connected");
        
    } catch (error) {
        console.log(error);
        
    }
}