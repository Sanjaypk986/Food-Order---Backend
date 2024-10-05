import express from 'express'
import { authuser } from '../../middlewares/authUser.js';
import { cancelCompleteOrder, cancelOrder, createOrder, getOrderById, myOrders, updateOrderStatusBasedOnRestaurants} from '../../controllers/orderController.js';

const router = express.Router()

router.post('/create', authuser, createOrder );
router.get('/my-orders', authuser, myOrders );
router.get('/:orderId', authuser, getOrderById);
router.patch('/:orderId/restaurants/:restaurantId/cancel', authuser,cancelOrder );
router.patch('/cancel/:orderId',authuser, cancelCompleteOrder);
router.patch('/update/status',updateOrderStatusBasedOnRestaurants)





export default router