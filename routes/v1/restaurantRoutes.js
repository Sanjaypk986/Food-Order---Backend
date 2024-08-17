import express from 'express'
import { loginRestaurant, logoutRestaurant, restaurantCreate, restaurantDelete, restaurantProfile, restaurantUpdate } from '../../controllers/restaurantController.js'
import { upload } from '../../middlewares/uploadMiddleware.js'
import { authRestaurant } from '../../middlewares/authRestaurant.js'

const router = express.Router()


router.post('/login',loginRestaurant)
router.get('/logout',authRestaurant,logoutRestaurant)

router.post('/create',upload.single('restaurantImage'),restaurantCreate)
router.get('/profile/:restaurantId',restaurantProfile)
router.patch('/update/:restaurantId',authRestaurant,upload.single('restaurantImage'),restaurantUpdate)
router.delete('/delete/:restaurantId',restaurantDelete)

router.get('/orders',)
router.get('/orders/:orderId',)


export default router