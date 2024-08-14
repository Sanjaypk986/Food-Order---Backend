import express from 'express'
import { restaurantCreate, restaurantProfile, restaurantUpdate } from '../../controllers/restaurantController.js'
import { upload } from '../../middlewares/uploadMiddleware.js'

const router = express.Router()

router.post('/create',upload.single('restaurantImage'),restaurantCreate)
router.get('/profile/:restaurantId',restaurantProfile)
router.patch('/update/:restaurantId',upload.single('restaurantImage'),restaurantUpdate)


export default router