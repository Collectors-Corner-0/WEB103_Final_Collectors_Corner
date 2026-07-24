import express from 'express'
import { getUser, getAllUsers } from '../controllers/users.js'

const userRouter = express.Router()

userRouter.get('/', getAllUsers)
userRouter.get('/collection/:user_ID', getUser)
userRouter.get('/:ID', getUser)

export default userRouter