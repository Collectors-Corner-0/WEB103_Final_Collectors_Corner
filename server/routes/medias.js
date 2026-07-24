import express from 'express'
import path from 'path'
import MediasController from '../controllers/medias.js'

import { fileURLToPath } from 'url'

// import MediasData from '../data/media.js'

const __filename = fileURLToPath(import.meta.url) //import.meta.url -> contains the URL of the current module file
const __dirname = path.dirname(__filename)

const router = express.Router()

router.get('/', MediasController.getMedias)

router.get('/:mediaID', (req, res) => {
    console.log('Media route hit: ', req.params.mediaID)
    res.status(200).sendFile(path.resolve(__dirname, '../public/media.html'))
})


export default router