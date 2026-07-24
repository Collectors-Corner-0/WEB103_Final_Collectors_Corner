import { Link } from "react-router-dom"

const NotFound = () => {
    return (
        <div className="container">
            <h2>404: Page Not Found</h2>
            <Link to="/">Return Home</Link>
        </div>
    )
}

export default NotFound;