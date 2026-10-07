import mongoose from "mongoose";
import dns from "node:dns";

// Ensure Node resolves MongoDB Atlas SRV records reliably on Windows/ISPs
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log("mongodb connected: " + connect.connection.host);
  } catch (error) {
    console.error("Error connecting to MongoDB: ", error);
  }
};

export default connectDB;
