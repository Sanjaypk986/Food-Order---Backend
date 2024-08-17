import express from 'express'
import { createCoupon, getallCoupons, updateCoupon } from '../../controllers/couponController.js';

const router = express.Router()

router.get('/',  getallCoupons);
router.post('/create', createCoupon);
router.patch('/update', updateCoupon);

export default router