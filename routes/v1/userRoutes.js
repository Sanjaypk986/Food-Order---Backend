import express from 'express'
import { loginUser, logoutUser, userCreate, userProfile } from '../../controllers/userController.js'
import { authuser } from '../../middlewares/authUser.js'

const router = express.Router()

router.post('/create',userCreate)
router.post('/login',loginUser)
router.get('/logout',logoutUser)
router.get('/profile/:userId',userProfile)


export default router