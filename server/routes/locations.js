import express from 'express'
import path from 'path'

import { fileURLToPath } from 'url'

import locationData from '../data/locations.js'

const __filename = fileURLToPath(import.meta.url) //import.meta.url -> contains the URL of the current module file
const __dirname = path.dirname(__filename)

const router = express.Router()

router.get('/', (req, res) => {
    res.status(200).json(locationData)
})

router.get('/:locationID', (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname, '../public/location.html'))
})


export default router