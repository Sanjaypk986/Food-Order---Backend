import express from 'express'
import { authuser } from '../../middlewares/authUser.js';
import { cancelOrder, createOrder, getOrderById, myOrders} from '../../controllers/orderController.js';

const router = express.Router()

router.post('/create', authuser, createOrder );
router.get('/my-orders', authuser, myOrders );
router.get('/:orderId', authuser, getOrderById);
router.patch('/cancel/:orderId', authuser,cancelOrder );





export default router