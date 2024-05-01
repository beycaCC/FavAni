import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

function Navbar() {

    // check if the user is logged in
    const navigate = useNavigate();
    const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
    const signUp = () => loginWithRedirect({ screen_hint: "signup" });

    return (
        <div className='navbar'>
            <div className='navbar-logo'>
                <Link to="/" style={{ textDecoration: 'none', color: 'white' }} className="nav-link">FavAni</Link>
            </div>
            <div className='navbar-menu'>
                <button className="btn-primary" onClick={() => navigate("/search")}>
                        Search
                </button>
                {!isAuthenticated ? (
                    <button className="btn-primary" onClick={loginWithRedirect}>
                        Login
                    </button>
                    ) : (
                    <button className="btn-primary" onClick={() => navigate("/profile")}>
                        User Dashboard
                    </button>
                )}  
                {!isAuthenticated ? (
                    <button className="btn-secondary" onClick={signUp}>
                        Create Account
                    </button>
                    ) : (
                    <button
                        className="exit-button"
                        onClick={() => logout({ returnTo: window.location.origin })}
                    >
                        LogOut
                    </button>
                )}  

                <div>
                    
                </div>
            </div>
        </div>
    )
}

export default Navbar