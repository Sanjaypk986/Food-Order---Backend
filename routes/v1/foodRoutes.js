import express from 'express'
import { deleteFood, foodCreate, foodUpdate, getAllFoods, getFoodById, searchFoods } from '../../controllers/foodController.js'
import { upload } from '../../middlewares/uploadMiddleware.js'
import { authRestaurant } from '../../middlewares/authRestaurant.js'

const router = express.Router()

router.get('/',getAllFoods)
router.get('/search', searchFoods);
router.get('/:foodId',getFoodById)
router.post('/create',upload.single('foodImage'),authRestaurant,foodCreate)
router.patch('/update/:foodId',upload.single('foodImage'),authRestaurant,foodUpdate)
router.delete('/delete/:foodId' ,authRestaurant,deleteFood)



export default router