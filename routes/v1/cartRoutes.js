import express from 'express'
import { authuser } from '../../middlewares/authUser.js'
import { addItem, removeItemFromCart, updateItemQuantity } from '../../controllers/cartController.js'


const router = express.Router()

router.post('/add-cart',authuser,addItem)
router.get('/view-cart',authuser)
router.patch('/update-item',authuser,updateItemQuantity)
router.delete('/remove-item',authuser,removeItemFromCart)


export default router