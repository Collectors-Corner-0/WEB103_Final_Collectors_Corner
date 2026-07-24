import { Link } from "react-router-dom"

const NotFound = () => {
    return (
        <div className="not-found">
            <h1>404: PAGE NOT FOUND</h1>
            <Link to="/">Return Home</Link>
        </div>
    )
}

export default NotFound;