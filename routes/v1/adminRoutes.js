import express from 'express'
import { adminCreate, checkAdmin, deleteUser, getAllUsers, loginAdmin, logoutAdmin } from '../../controllers/adminController.js'
import { authAdmin } from '../../middlewares/authAdmin.js'

const router = express.Router()

router.post('/create', adminCreate)
router.post('/login', loginAdmin)
router.get('/logout',logoutAdmin)

// user
router.get('/users',authAdmin,getAllUsers)
router.delete('delete/userId',authAdmin,deleteUser)

// restaurant
router.get('/restaurants',getAllUsers)

// for front-end routing
router.get('/check-admin',authAdmin,checkAdmin)