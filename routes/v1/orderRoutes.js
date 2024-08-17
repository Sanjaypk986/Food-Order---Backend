import express from 'express'
import { authuser } from '../../middlewares/authUser.js';
import { createOrder } from '../../controllers/orderController.js';

const router = express.Router()

router.post('/create', authuser, createOrder );
router.get('/:orderId', authuser, );
router.patch('/cancel/:orderId', authuser, );
router.get('/user/:userId', authuser, );



export default router