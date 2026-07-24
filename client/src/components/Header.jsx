import { Outlet, Link, useNavigate } from "react-router-dom"
import { HashLink } from "react-router-hash-link"

const Header = () => {

    return (
        <div className="page-container">
            <nav>
                <Link to="/collection">My Collection</Link>
                <Link to="/browse">Browse</Link>
            </nav>
            <Outlet />
        </div>
    )
}

export default Header;