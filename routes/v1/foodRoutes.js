import express from 'express'
import { deleteFood, foodCreate, foodUpdate, getAllFoods, getFoodById, searchFoods } from '../../controllers/foodController.js'
import { upload } from '../../middlewares/uploadMiddleware.js'

const router = express.Router()

router.get('/',getAllFoods)
router.get('/:foodId',getFoodById)
router.post('/create',upload.single('foodImage'),foodCreate)
router.patch('/update/:foodId',upload.single('foodImage'),foodUpdate)
router.delete('/delete/:foodId',deleteFood)
router.get('/foods/search', searchFoods);


export default router