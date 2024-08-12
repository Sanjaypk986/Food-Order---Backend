import express from 'express'
import { userCreate } from '../../controllers/userController'

const router = express.Router()

router.post('/create',userCreate)
router.post('/login',)
router.get('/logout',)


export default router