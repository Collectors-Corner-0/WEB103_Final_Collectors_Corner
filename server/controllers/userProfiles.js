import { pool } from '../config/database.js'

export const getAllUserProfiles = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM user_profiles ORDER BY id ASC')
        res.status(200).json(results.rows)
    } catch (error) {
        res.status(409).json( { error: error.message } )
    }
}

export const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM user_profiles WHERE id = $1', [id])
        res.status(200).json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}