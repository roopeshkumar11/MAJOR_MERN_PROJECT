import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from 'dotenv';
dotenv.config();


cloudinary.config({ 
    cloud_name:"dpglkhrp5", 
    api_key: 553377751336271, 
    api_secret:"kk3lbA4ApUiekTjnCqrSLqgJmCY",
  
});
console.log("name",process.env.CLOUDINARY_CLOUD_NAME)
const uploadcloundinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("File uploaded to Cloudinary:", response.url);

        // Remove the local file after successful upload
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);

        // Remove the local file if the upload operation failed
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

export { uploadcloundinary };
