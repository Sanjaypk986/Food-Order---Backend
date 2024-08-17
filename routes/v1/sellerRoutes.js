import express from 'express'
import { loginSeller, logoutSeller, sellerCreate, sellerDelete, sellerProfile } from '../../controllers/sellerController.js'
import { authseller } from '../../middlewares/authSeller.js'


const router = express.Router()


router.post('/login',loginSeller)
router.get('/logout',authseller,logoutSeller)

router.post('/create',sellerCreate)
router.get('/:sellerId',authseller,sellerProfile)
router.delete('/delete/:sellerId',sellerDelete)

router.get('/orders',)
router.get('/orders/:orderId',)



export default router