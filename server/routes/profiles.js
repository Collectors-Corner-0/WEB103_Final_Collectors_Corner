import express from 'express'
import { getUserProfile, getAllUserProfiles } from '../controllers/userProfiles.js'

const profileRouter = express.Router()

profileRouter.get('/', getAllUserProfiles)
profileRouter.get('/collection/:user_ID', getUserProfile)

export default profileRouter