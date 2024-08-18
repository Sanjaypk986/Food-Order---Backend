import express from 'express'
import { applyCoupon, createCoupon, getallCoupons, updateCoupon } from '../../controllers/couponController.js';
import { authuser } from '../../middlewares/authUser.js';

const router = express.Router()

router.get('/',  getallCoupons);
router.post('/create', createCoupon);
router.patch('/update', updateCoupon);
router.post('/apply',authuser, applyCoupon);

export default router