import express from 'express'
import { foodCreate, foodUpdate } from '../../controllers/foodController.js'
import { upload } from '../../middlewares/uploadMiddleware.js'

const router = express.Router()

router.post('/create',upload.single('foodImage'),foodCreate)
router.patch('/update/:foodId',upload.single('foodImage'),foodUpdate)


export default router