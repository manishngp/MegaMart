import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
};

export default connectDB;