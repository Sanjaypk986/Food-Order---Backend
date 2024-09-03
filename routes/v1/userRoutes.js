import express from 'express'
import { checkUser, loginUser, logoutUser, resetPassword, resetRequest, userCreate, userProfile, userUpdate } from '../../controllers/userController.js'
import { authuser } from '../../middlewares/authUser.js'
import { upload } from '../../middlewares/uploadMiddleware.js'

const router = express.Router()

router.post('/create',upload.single('userImage'),userCreate)
router.post('/login',loginUser)
router.get('/logout',authuser,logoutUser)
router.get('/profile',authuser,userProfile)
router.patch('/update/:userId',upload.single('userImage'),authuser,userUpdate)
router.post('/reset-request',resetRequest)
router.post('/reset-password',resetPassword)

// for front-end routing
router.get('/check-user',authuser,checkUser)

// forgot password want to implement

export default router