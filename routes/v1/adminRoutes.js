import express from 'express'
import { adminCreate, checkAdmin, deleteUser, getAllRestaurants, getAllUsers, loginAdmin, logoutAdmin, orderDelete, restaurantDelete } from '../../controllers/adminController.js'
import { authAdmin } from '../../middlewares/authAdmin.js'

const router = express.Router()

router.post('/create', adminCreate)
router.post('/login', loginAdmin)
router.get('/logout',logoutAdmin)

// user
router.get('/users',authAdmin,getAllUsers)
router.delete('/users/delete/userId',authAdmin,deleteUser)

// restaurant
router.get('/restaurants',getAllRestaurants)
router.delete('restaurants/delete/:restaurantId',authAdmin,restaurantDelete)

//orders
router.get('/orders',authAdmin,getAllRestaurants)
router.delete('orders/delete/:orderId',authAdmin,orderDelete)

// for front-end routing
router.get('/check-admin',authAdmin,checkAdmin)