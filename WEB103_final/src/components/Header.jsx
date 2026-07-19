import { Outlet, Link, useNavigate } from "react-router-dom"
import { HashLink } from "react-router-hash-link"

// import { UserAuth } from "../context/AuthContext"

const Header = () => {
    // const {session, signOut} = UserAuth();
    // const navigate = useNavigate();

    // const handleSignOut = async (e) => {
    //     e.preventDefault();

    //     try {
    //         await signOut();
    //         navigate("/");
    //     } catch (err) {
    //         console.error(err);
    //     }
    // }

    return (
        <div className="page-container">
            <nav>
                <Link to="/">My Collection</Link>
                <Link to="/browse">Browse</Link>

                <a href="/signin">Sign In</a>

                {/* {session ?
                    <a className="sign-out-btn" onClick={handleSignOut}>Sign Out</a> : <a className="sign-in-btn" onClick={handleSignIn}>Sign In</a>
                } */}
            </nav>
            <Outlet />
        </div>

        // <div className="header-container">
        //     <nav className={session ? "signed-in" : "signed-out"}>
        //         <Link to="/my-collection">My Collection</Link>
        //         <Link to="/browse">Browse</Link>

        //         {session ?
        //             <a className="sign-out-btn" onClick={handleSignOut}>Sign Out</a> : <a className="sign-in-btn" onClick={handleSignIn}>Sign In</a>
        //         }
        //     </nav>
        //     <Outlet />
        // </div>
    )
}

export default Header;