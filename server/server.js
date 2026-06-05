import express from 'express'
import locationRouter from './routes/locations.js'

const app = express()

// initialize middleware
app.use('/public', express.static('./public'))
app.use('/scripts', express.static('./public/scripts'))
app.use('/location', locationRouter)


// Define a route for the root URL
app.get('/', (req, res) => {
    res.status(200).send('<h1>LISTICLE PROJECT P1</h1>')
})


// Start server on Port 3001
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})



// Queer Hot Spots in NYC
// The Center, BGSQD, Hivemindbooks, Bluestockings, Stonewall, NYC Resistor, From Here To Sunday, The Nonbinarian Bookstore, 
// Shared Attributes: Place/Venue Name, Borough, Neighborhood, if Store/if 3rd-Space, Masks Required?