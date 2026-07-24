import { useState } from 'react'
import './App.css'

import MediaCard from '../../src/components/MediaCard'
import UserProfilesAPI from '../../src/services/UserProfilesAPI'

const MyCollection = ({index}) => {

  function addMedia() {
    // open modal with form of title, creator, rating, mediaImg, mediaLink fields. 
    // send form data to database of respective media (books, movies, music, etc.)
    // then call function to load data again
  }

  const [profile, setProfile] = useState([])

  useEffect (() => {
    (async () => {
      try {
        const profileData = await UserProfilesAPI.getProfileByID(index)
        setUserProfiles(profileData)
      } catch (error) {
        console.error('Error fetching PROFILE data: ', error)
      }
    }) ()
  }, [index])

  return (
    <>
    <div className="collector-container">

      <Profile />

      <section className="media-row-container">
        <div className="media-row">
          {
            medias.map(media => 
              <MediaCard
                media = {media}
              />
            )
          }
          <button onClick={addMedia}>✚</button> {/* If in session, SHOW */}
        </div>
      </section>

    </div>
    </>
  )
}

export default MyCollection;