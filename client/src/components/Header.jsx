import { NavLink } from 'react-router-dom'

const Header = ({ currentUserId }) => {
  return (
    <nav>
      <NavLink to="/" end>
        Browse
      </NavLink>
      <NavLink to={`/collections/${currentUserId}`}>My Collection</NavLink>
      <NavLink to="/collections" end>
        Collections
      </NavLink>
    </nav>
  )
}

export default Header
