import { useParams } from 'react-router-dom'
import useFetch from '../hooks/useFetch'
import MediaCard from '../components/MediaCard'

const UserCollection = ({ apiUrl }) => {
  const { userId } = useParams()
  const { data: user, loading: userLoading, error: userError } = useFetch(`${apiUrl}/users/${userId}`)
  const { data: entries, loading: entriesLoading, error: entriesError } = useFetch(`${apiUrl}/library/${userId}`)

  if (userLoading || entriesLoading) return <p>Loading…</p>
  if (userError) return <p className="error-message">{userError}</p>
  if (entriesError) return <p className="error-message">{entriesError}</p>

  return (
    <div className="collector-container">
      <section className="user-profile">
        <div className="profile-picture">
          {user.avatarurl && <img src={user.avatarurl} alt={user.username} />}
        </div>
        <div className="profile-text">
          <h3>{user.display_name || user.username}</h3>
          {user.favorite_genres && <h5>Enjoys: {user.favorite_genres}</h5>}
          {user.bio && <p>{user.bio}</p>}
          <p>{user.library_entry_count} items in library</p>
        </div>
      </section>

      <section className="media-row-container">
        <div className="media-row">
          {entries.map((entry) => (
            <MediaCard key={entry.id} media={entry} editHref={`/library/${entry.id}/edit`} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default UserCollection
