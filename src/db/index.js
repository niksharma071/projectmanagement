import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.db_url);
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Exit process with failure
    process.exit(1);
  }
}


export default connectDB