import { useState } from 'react'
import './App.css'

import MediaCard from './components/MediaCard'

function App() {
  // Set current user
  // const [user, setUser] = useState([]);

  // Have different hooks for each media type
  // const [medias, setMedias] = useState([]);

  const user = {name: "PercyLover123", enjoying: "Percy Jackson", about: "I love the Percy Jackson series so so so much!", pp: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F9d%2F2f%2F5b%2F9d2f5b5bf6d06ea3bdaadc031eeb6d27.jpg&f=1&nofb=1&ipt=dd6c3681d4569c6cea3f648538c587f3c82bb23f4da1e4079f88b022ef4a1ea4"}

  const medias = [
    {title: "The Lightning Theif", creator: "Rick Riordan", rating: 5, mediaImg: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages-na.ssl-images-amazon.com%2Fimages%2FI%2F91uEuBMbkSL.jpg&f=1&nofb=1&ipt=a6246360deb438e86d78460c7036954618edcf82fc6d772365c1e4bf37c4913d", mediaLink: "https://www.readriordan.com/book/the-lightning-thief-reissue/"},
    {title: "The Lightning Theif", creator: "Rick Riordan", rating: 4, mediaImg: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages-na.ssl-images-amazon.com%2Fimages%2FI%2F91uEuBMbkSL.jpg&f=1&nofb=1&ipt=a6246360deb438e86d78460c7036954618edcf82fc6d772365c1e4bf37c4913d", mediaLink: "https://www.readriordan.com/book/the-lightning-thief-reissue/"},
    {title: "The Lightning Theif", creator: "Rick Riordan", rating: 3, mediaImg: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages-na.ssl-images-amazon.com%2Fimages%2FI%2F91uEuBMbkSL.jpg&f=1&nofb=1&ipt=a6246360deb438e86d78460c7036954618edcf82fc6d772365c1e4bf37c4913d", mediaLink: "https://www.readriordan.com/book/the-lightning-thief-reissue/"},
    {title: "The Lightning Theif", creator: "Rick Riordan", rating: 2, mediaImg: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages-na.ssl-images-amazon.com%2Fimages%2FI%2F91uEuBMbkSL.jpg&f=1&nofb=1&ipt=a6246360deb438e86d78460c7036954618edcf82fc6d772365c1e4bf37c4913d", mediaLink: "https://www.readriordan.com/book/the-lightning-thief-reissue/"},
    {title: "The Lightning Theif", creator: "Rick Riordan", rating: 1, mediaImg: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages-na.ssl-images-amazon.com%2Fimages%2FI%2F91uEuBMbkSL.jpg&f=1&nofb=1&ipt=a6246360deb438e86d78460c7036954618edcf82fc6d772365c1e4bf37c4913d", mediaLink: "https://www.readriordan.com/book/the-lightning-thief-reissue/"},
    {title: "The Lightning Theif", creator: "Rick Riordan", rating: 0, mediaImg: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages-na.ssl-images-amazon.com%2Fimages%2FI%2F91uEuBMbkSL.jpg&f=1&nofb=1&ipt=a6246360deb438e86d78460c7036954618edcf82fc6d772365c1e4bf37c4913d", mediaLink: "https://www.readriordan.com/book/the-lightning-thief-reissue/"},
    {title: "The Lightning Theif", creator: "Rick Riordan", rating: 5, mediaImg: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages-na.ssl-images-amazon.com%2Fimages%2FI%2F91uEuBMbkSL.jpg&f=1&nofb=1&ipt=a6246360deb438e86d78460c7036954618edcf82fc6d772365c1e4bf37c4913d", mediaLink: "https://www.readriordan.com/book/the-lightning-thief-reissue/"},
    {title: "The Lightning Theif", creator: "Rick Riordan", rating: 5, mediaImg: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages-na.ssl-images-amazon.com%2Fimages%2FI%2F91uEuBMbkSL.jpg&f=1&nofb=1&ipt=a6246360deb438e86d78460c7036954618edcf82fc6d772365c1e4bf37c4913d", mediaLink: "https://www.readriordan.com/book/the-lightning-thief-reissue/"}
  ]

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
        </div>
      </section>

    </div>
    </>
  )
}

export default App
