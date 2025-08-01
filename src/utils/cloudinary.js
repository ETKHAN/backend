import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



export const uploadOnCloudinary = async function(localFilePath){

  try{
    if(!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {resource_type: 'auto'});

    console.log('file has been uploaded to cloudinary, successfully!!!');
    fs.unlinkSync(localFilePath);
    return response;
  }catch(err){
    fs.unlinkSync(localFilePath);
    return null;
  }


}