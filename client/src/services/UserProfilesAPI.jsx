const API_BASE_URL = `/api/user-profiles`

const getAllProfiles = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}`)
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching USER PROFILE data: ', error)
    }
}

const getProfileByID = async (profileID) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${profileID}`)
        const data = response.json()
        return data
    } catch (error) {
        console.error('Error fetching PROFILE BY ID: ', error)
    }
}

export default {
    getAllProfiles, getProfileByID
}