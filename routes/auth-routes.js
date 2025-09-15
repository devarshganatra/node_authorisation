const express=require('express')
const {loginUser,registerUser,changePassword}=require('../controllers/auth-controller')
const authMiddleware=require('../middleware/auth-middleware')
const router=express.Router();
router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/change-password',authMiddleware,changePassword);

module.exports=router