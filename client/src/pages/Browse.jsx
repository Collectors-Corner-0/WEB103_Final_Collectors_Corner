import ProfileCard from "../../src/components/ProfileCard"

const Browse = () => {
    
    const [userProfiles, setUserProfiles] = useState([])

    useEffect (() => {
      (async () => {
        try {
          const profilesData = await UserProfilesAPI.getAllProfiles()
          setUserProfiles(profilesData)
        } catch (error) {
          console.error('Error fetching PROFILE data: ', error)
        }
      }) ()
    }, [])

    return(
        <div className="profiles">
            {
            userProfiles.map(profile => 
                <div className="profile" key={profile.id}>
                    <ProfileCard
                    profile = {profile}
                    />
                </div>
            )
            }
        </div>
    )
}

export default Browse;