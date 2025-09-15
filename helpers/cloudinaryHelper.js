const cloudinary=require('../config/cloudinary');

const uploadToCloudinary=async(filePath)=>{
    try{
        const result= await cloudinary.uploader.upload(filePath);
        return {
            url: result.secure_url,
            publicId: result.public_id,
        }

    }catch(e){
        console.log("Error while uploading to cloudinary",e)
        throw new Error("Error uploading to cloudinary")
    }
}
module.exports={
    uploadToCloudinary
}