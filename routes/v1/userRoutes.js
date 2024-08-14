import express from 'express'
import { loginUser, logoutUser, userCreate, userProfile, userUpdate } from '../../controllers/userController.js'
import { authuser } from '../../middlewares/authUser.js'

const router = express.Router()

router.post('/create',userCreate)
router.post('/login',loginUser)
router.get('/logout',logoutUser)
router.get('/profile/:userId',authuser,userProfile)
router.patch('/update/:userId',authuser,userUpdate)


export default router