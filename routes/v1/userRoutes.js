import express from 'express'
import { loginUser, logoutUser, userCreate, userProfile, userUpdate } from '../../controllers/userController.js'
import { authuser } from '../../middlewares/authUser.js'
import { upload } from '../../middlewares/uploadMiddleware.js'

const router = express.Router()

router.post('/create',upload.single('userImage'),userCreate)
router.post('/login',loginUser)
router.get('/logout',logoutUser)
router.get('/profile/:userId',authuser,userProfile)
router.patch('/update/:userId',upload.single('userImage'),authuser,userUpdate)

// reset and forgot password want to implement

export default router