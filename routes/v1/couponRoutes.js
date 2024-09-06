import express from 'express'
import { applyCoupon, createCoupon, getallCoupons, removeCoupon, updateCoupon } from '../../controllers/couponController.js';
import { authuser } from '../../middlewares/authUser.js';
import { authAdmin } from '../../middlewares/authAdmin.js';

const router = express.Router()

router.get('/',  getallCoupons);
router.post('/create',authAdmin, createCoupon);
router.patch('/update', authAdmin,updateCoupon);
router.post('/apply',authuser, applyCoupon);
router.delete('/cancel',authuser, removeCoupon);

export default router