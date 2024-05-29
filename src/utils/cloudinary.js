import { v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { ApiError } from "./ApiError";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})




const uploadOnCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null;
         
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"

        })
        //file has been uploaded
        // console.log("file is uploaded", response.url);
        // console.log(response);
        fs.unlinkSync(localFilePath)
        return response


    } catch (error) {
        console.log("cloudinary Error: " , error);
        fs.unlinkSync(localFilePath)//remove the file
        return null
    }
}


const deleteOnCloudinary = async(imgUrl)=>{
    try {

        if(!imgUrl){
            throw new ApiError(400, "ImgUrl is missing")
        }

        const urlParts = imgUrl.split('/');
        const publicIdWithFormat = urlParts[urlParts.length - 1];
        const publicId = publicIdWithFormat.split('.')[0];


        //deleting the file from cloudinary
        const result = cloudinary.uploader.destroy(publicId);


        return result;


    } catch (error) {
        throw new ApiError(500, "Error occured while deleting the file on cloudinary")
    }

}




export {uploadOnCloudinary, deleteOnCloudinary}





