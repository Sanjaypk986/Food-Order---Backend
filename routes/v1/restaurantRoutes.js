import express from 'express'
import { restaurantCreate, restaurantProfile, restaurantUpdate } from '../../controllers/restaurantController.js'

const router = express.Router()

router.post('/create',restaurantCreate)
router.get('/profile/:restaurantId',restaurantProfile)
router.patch('/update/:restaurantId',restaurantUpdate)


export default router