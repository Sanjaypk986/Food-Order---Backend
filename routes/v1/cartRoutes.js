import express from 'express'
import { authuser } from '../../middlewares/authUser.js'
import { addItem } from '../../controllers/cartController.js'


const router = express.Router()

router.post('/add-cart',authuser,addItem)
router.get('/view-cart',authuser)
router.patch('/update/:cartId',authuser)
router.delete('/update/:cartId',authuser)


export default router