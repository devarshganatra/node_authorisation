const Image=require('../models/Image')
const {uploadToCloudinary}=require('../helpers/cloudinaryHelper')
const fs=require('fs')
const cloudinary=require('../config/cloudinary')
const uploadImage= async(req,res)=>{
    try{
        if(!req.file){
            return res.status(400).json({
                success: false,
                message: "File is required please upload an image"
            })
        }
        // upload to cloudinary
        const {url, publicId}=await uploadToCloudinary(req.file.path)

        //store the image url and publicid
        const newlyUploadedImage=new Image({
            url,
            publicId,
            uploadedBy: req.userInfo.userId
        })
        await newlyUploadedImage.save();
        //delete the file from local storeage

        fs.unlinkSync(req.file.path);
        res.status(201).json({
            success:true,
            message: 'image uploaded successfully',
            image: newlyUploadedImage
        })
    }catch(e){
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Something went wrong please try again"
        })
    }
}

const fetchImagesController=async(req,res)=>{
    try{
        const page=parseInt(req.query.page||1);
        const limit=parseInt(req.query.limit)||5;
        const skip=(page-1)*limit;
        const sortBy=req.query.sortBy || 'createdAt';
        const sortOrder=req.query   .sortOrder==='asc'?1:-1;
        const totalImages= await Image.countDocuments();
        const totalPages=Math.ceil(totalImages/limit);
        const sortObj={};
        sortObj[sortBy]=sortOrder;
        const images=(await Image.find()).toSorted(sortObj).skip(skip).limit(limit)

        if(images){
            res.status(200).json({
                success:true,
                currentPage:page,
                totalPages:totalPages,
                totalImages:totalImages,
                data:images
            })
        }
    }catch(e){
        console.log(e);
        req.status(500).json({
            success:false,
            message:"Something went wrong"
        })
    }
}
const deleteImageController=async (req,res)=>{
    try{
        const getCurrentIdOfImageToBeDeleted=req.params.id;
        const getCurrentId=req.userInfo.userId;
        
        const image=await Image.findById(getCurrentIdOfImageToBeDeleted);
         
        if(!image){
            return res.status(404).json({
                success:false,
                message:"image not found"
            })
        }
        // check if the image is uploaded by current user
        if(image.uploadedBy.toString()!==getCurrentId){
            return res.status(403).json({
                success: false,
                message:"You are not authorised to delete this image"
            })
        }
        //delte the image from cloudinary
        await cloudinary.uploader.destroy(image.publicId);
        //delete this image from mongodb database
        await Image.findByIdAndDelete(getCurrentIdOfImageToBeDeleted)
        
        res.status(200).json({
            message:"image deleted successfully"
            
        })

    }catch(e){
        console.log(e);
        req.status(500).json({
            success:false,
            message:"Something went wrong while deleting image"
        })
    }
}

module.exports={
    uploadImage,fetchImagesController,deleteImageController
}