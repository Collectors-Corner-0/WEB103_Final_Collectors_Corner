import { Link, useParams } from 'react-router-dom'
import useFetch from '../hooks/useFetch'
import Spinner from '../components/Spinner'

const UserCollections = ({ apiUrl, currentUserId }) => {
  const { userId } = useParams()
  const isOwnCollections = currentUserId != null && Number(userId) === currentUserId
  const { data: user, loading: userLoading, error: userError } = useFetch(`${apiUrl}/users/${userId}`)
  const { data: collections, loading: collectionsLoading, error: collectionsError } = useFetch(
    `${apiUrl}/collections/${userId}`
  )

  if (userLoading || collectionsLoading) return <Spinner />
  if (userError) return <p className="error-message">{userError}</p>
  if (collectionsError) return <p className="error-message">{collectionsError}</p>

  return (
    <div className="collector-container">
      <section className="user-profile">
        <div className="profile-picture">{user.avatarurl && <img src={user.avatarurl} alt={user.username} />}</div>
        <div className="profile-text">
          <h3>{user.display_name || user.username}</h3>
          {user.favorite_genres && <h5>Enjoys: {user.favorite_genres}</h5>}
          {user.bio && <p>{user.bio}</p>}
        </div>
      </section>

      <div className="page-heading">
        <h2>{isOwnCollections ? 'My Collections' : `${user.username}'s Collections`}</h2>
      </div>

      {collections.length === 0 ? (
        <p>
          {isOwnCollections
            ? "You don't have any collections yet — add media from Browse to create your first one."
            : `${user.username} hasn't created any collections yet.`}
        </p>
      ) : (
        <section className="media-row-container">
          <div className="media-row">
            {collections.map((collection) => (
              <Link key={collection.id} to={`/collections/${userId}/${collection.id}`} className="user-card">
                <p>{collection.name}</p>
                <p>{collection.item_count} items</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default UserCollections
