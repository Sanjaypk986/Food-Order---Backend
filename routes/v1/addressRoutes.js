import express from 'express'
import { addressCreate, addressUpdate } from '../../controllers/addressController.js'
import { authuser } from '../../middlewares/authUser.js'


const router = express.Router()

router.post('/create',authuser,addressCreate)
router.patch('/update',authuser,addressUpdate)


export default router