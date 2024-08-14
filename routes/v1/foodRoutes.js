import express from 'express'
import { foodCreate, foodUpdate } from '../../controllers/foodController.js'

const router = express.Router()

router.post('/create',foodCreate)
router.patch('/update/:foodId',foodUpdate)


export default router