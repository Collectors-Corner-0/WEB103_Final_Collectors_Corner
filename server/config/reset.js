import { pool } from './database.js'
import './dotenv.js'
import userProfileData from '../data/userProfiles.js'
import userData from '../data/users.js'

// DATABASES:
// USERS ✅
// USER PROFILES ✅
// MEDIA
// MEDIA ENTRIES
// TAGS
// MEDIA TAGS


// USERS
const createUsersTable = async () => {
    // DROP TABLE IF EXISTS users;
    const createTableQuery = `

        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`
    try {
        const res = await pool.query(createTableQuery)
        console.log('🎉 USERS table created successfully')
    }catch (err) {
        console.error('⚠️ error creating USERS table', err)
    }
}

const createUserProfilesTable = async () => {
    const createTableQuery = `
        DROP TABLE IF EXISTS user_profiles;

        CREATE TABLE IF NOT EXISTS user_profiles (
            user_id INTEGER PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            enjoying VARCHAR(255) NOT NULL,
            about VARCHAR(255) NOT NULL,
            pp TEXT,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )`
    try {
        const res = await pool.query(createTableQuery)
        console.log('🎉 USER PROFILES table created successfully')
    }catch (err) {
        console.error('⚠️ error creating USER PROFILES table', err)
    }
}


const seedUsersTable = async() => {
    await createUsersTable()
    await createUserProfilesTable();
    
    for (let i = 0; i < userData.length; i++) {
        const user = userData[i];
        const profile = userProfileData[i];

        // console.log(user.email);

        try {
            const result = await pool.query(
                `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id`, 
                [user.email, user.password_hash, user.role]
            );

            const userID = result.rows[0].id;

            await pool.query(
                `INSERT INTO user_profiles (user_id, name, enjoying, about, pp) VALUES ($1, $2, $3, $4, $5)`,
                [
                    userID,
                    profile.name,
                    profile.enjoying,
                    profile.about,
                    profile.pp
                ]
            );

            console.log(`✅ USER ${user.email} for PROFILE ${profile.name} inserted`);
            // console.log(result);
            
        } catch (err) {
            console.error(err);
        }
    }
}

await seedUsersTable();
