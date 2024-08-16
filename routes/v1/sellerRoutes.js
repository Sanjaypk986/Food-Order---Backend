import express from 'express'
import { loginSeller, logoutSeller, sellerCreate, sellerDelete, sellerProfile } from '../../controllers/sellerController.js'


const router = express.Router()


router.post('/login',loginSeller)
router.get('/logout',logoutSeller)

router.post('/create',sellerCreate)
router.get('/:sellerId',sellerProfile)
router.delete('/delete/:sellerId',sellerDelete)

router.get('/orders',)
router.get('/orders/:orderId',)



export default router