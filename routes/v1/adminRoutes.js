import express from 'express'

const router = express.Router()

router.post('/login',loginUser)
router.get('/logout',logoutUser)
router.get('/profile/:userId',authuser,)
router.patch('/update/:userId',authuser,)
