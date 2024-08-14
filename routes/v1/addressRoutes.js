import express from 'express'
import { addressCreate, addressUpdate } from '../../controllers/addressController.js'


const router = express.Router()

router.post('/create',addressCreate)
router.patch('/update/:addressId',addressUpdate)


export default router