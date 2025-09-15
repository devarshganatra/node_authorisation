const express=require('express')
const router=express.Router()
const authMiddleware=require('../middleware/auth-middleware')
const isAdminUser=require('../middleware/admin-middleware')
const uploadmiddleware=require('../middleware/upload-middleware')

const {uploadImage,fetchImagesController,deleteImageController}=require('../controllers/image-controller')

//upload the image
router.post('/upload',authMiddleware,isAdminUser,uploadmiddleware.single('image'),uploadImage)
//get all the images
router.get('/get',authMiddleware,isAdminUser,fetchImagesController)
//delete image
router.delete('/:id',authMiddleware,isAdminUser,deleteImageController)
module.exports=router