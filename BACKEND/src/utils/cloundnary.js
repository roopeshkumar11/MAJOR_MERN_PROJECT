import { v2 as cloudinary} from "cloudinary";
import fs from "fs";

 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUND_NAME, 
    api_key: process.env.CLOUNDINARY_API_KEY, 
    api_secret: process.env.CLOUNDINARY_API_SECRECT // Click 'View API Keys' above to copy your API secret
});


const uploadcloundinary=async (localFilePath)=>{
    try{
        if(!localFilePath) return null
      const response=await  cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })

        console.log("file upload is cloudinary ",response.url)
        return response;
    }
    catch(error){
   fs.unlinkSync(localFilePath)  // remove the locally saved temporary file as the upload operation failed
   return null
    }
    
}

export{uploadcloundinary  }