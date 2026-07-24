import express from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'

import './config/dotenv.js'
import MediasRouter from './routes/medias.js'
import profileRouter from './routes/profiles.js'

const app = express()

// initialize middleware
app.use(cors())
// app.use('/public', express.static('./public'))
// app.use('/scripts', express.static('./public/scripts'))
app.use('/browse', profileRouter)


// Define a route for the root URL
app.get('/', (req, res) => {
    res.status(200).send('<h1>COLLECTOR\'S CORNER</h1>')
    // res.status(200).sendFile(path.resolve('public', '.../client/index.html'))
})


// Start server on Port 3001
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})


