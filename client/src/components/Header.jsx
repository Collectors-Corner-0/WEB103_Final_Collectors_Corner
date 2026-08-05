import { NavLink } from 'react-router-dom'

const Header = ({ authUrl, user, onLogout }) => {
  const handleLogout = async () => {
    await fetch(`${authUrl}/logout`, { credentials: 'include' })
    onLogout()
  }

  return (
    <nav>
      <NavLink to="/" end>
        Browse
      </NavLink>
      <NavLink to="/collections" end>
        Collections
      </NavLink>

      <div className="nav-auth">
        {user ? (
          <>
            <NavLink to={`/collections/${user.id}`}>My Collections</NavLink>
            <span className="header-user">
              {user.avatarurl && <img src={user.avatarurl} alt={user.username} className="header-avatar" />}
              {user.username}
            </span>
            <button type="button" className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </div>
    </nav>
  )
}

export default Header
