import express from 'express'
import { authuser } from '../../middlewares/authUser.js';
import { checkoutPayment, sessionStatus } from '../../controllers/paymentController.js';
import Stripe from 'stripe';

const stripe = new Stripe();

const router = express.Router()

router.post('/create-checkout-session', authuser, checkoutPayment );
router.get('/session-status', authuser, sessionStatus );





export default router