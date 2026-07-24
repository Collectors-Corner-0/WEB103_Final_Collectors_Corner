import { useState } from 'react'
import './App.css'

import MediaCard from '../components/MediaCard'

function MyCollection() {
  // Set current user
  // const [user, setUser] = useState([]);

  // Have different hooks for each media type
  // const [medias, setMedias] = useState([]);

  function addMedia() {
    // open modal with form of title, creator, rating, mediaImg, mediaLink fields. 
    // send form data to database of respective media (books, movies, music, etc.)
    // then call function to load data again
  }

  return (
    <>
    <div className="collector-container">

      <section className="user-profile">
        <div className="profile-picture">
          <img src={user.pp} />
        </div>
        <div className="profile-text">
          <h3>{user.name}</h3>
          <h5>Currently Enjoying: {user.enjoying}</h5>
          <p>{user.about}</p>
        </div>
      </section>

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