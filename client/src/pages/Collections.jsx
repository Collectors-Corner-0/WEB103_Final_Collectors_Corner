import { Link } from 'react-router-dom'
import useFetch from '../hooks/useFetch'

const Collections = ({ apiUrl }) => {
  const { data: users, loading, error } = useFetch(`${apiUrl}/users`)

  if (loading) return <p>Loading…</p>
  if (error) return <p className="error-message">{error}</p>

  return (
    <div className="collector-container">
      <section className="media-row-container">
        <div className="media-row">
          {users.map((user) => (
            <Link key={user.id} to={`/collections/${user.id}`} className="user-card">
              {user.avatarurl && <img src={user.avatarurl} alt={user.username} />}
              <p>{user.username}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Collections
