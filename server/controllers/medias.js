import { pool } from '../config/database.js'

const getMedias = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM collection ORDER BY id ASC')
        res.status(200).json(results.rows)
    } catch (error) {
        res.status(409).json( { error: error.message } )
    }
}
export default { 
    getMedias
}