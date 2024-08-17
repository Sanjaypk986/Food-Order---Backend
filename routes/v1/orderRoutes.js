import express from 'express'
import { authuser } from '../../middlewares/authUser.js';
import { cancelOrder, createOrder, getOrderById } from '../../controllers/orderController.js';

const router = express.Router()

router.post('/create', authuser, createOrder );
router.get('/:orderId', authuser, getOrderById);
router.patch('/cancel/:orderId', authuser,cancelOrder );
router.get('/user/:userId', authuser, );



export default router