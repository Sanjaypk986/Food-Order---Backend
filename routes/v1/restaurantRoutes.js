import express from 'express'
import { checkRestaurant, confirmOrder, getRestaurantOrders, getSingleOrder, loginRestaurant, logoutRestaurant, restaurantCreate, restaurantDelete, restaurantProfile, restaurantUpdate } from '../../controllers/restaurantController.js'
import { upload } from '../../middlewares/uploadMiddleware.js'
import { authRestaurant } from '../../middlewares/authRestaurant.js'

const router = express.Router()


router.post('/login',loginRestaurant)
router.get('/logout',authRestaurant,logoutRestaurant)

router.post('/create',upload.single('restaurantImage'),restaurantCreate)
router.get('/profile/:restaurantId',restaurantProfile)
router.patch('/update/:restaurantId',authRestaurant,upload.single('restaurantImage'),restaurantUpdate)
router.delete('/delete/:restaurantId',restaurantDelete)

router.get('/orders',authRestaurant,getRestaurantOrders)
router.get('/orders/:orderId',authRestaurant,getSingleOrder)
router.patch('/orders/:orderId',authRestaurant,confirmOrder)

// check restaurant 

// for front-end routing
router.get('/check-restaurant',authRestaurant,checkRestaurant)

export default router