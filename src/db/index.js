import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try{
    // const connectionInstance = await mongoose.connect(`mongodb://localhost:27017/${DB_NAME}`)
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log('DB connected successfully !! ', connectionInstance.connection.host)
  }catch(err){
    console.error('DB connection FAILED : ', err);
    process.exit(1)
  }
}


export default connectDB;