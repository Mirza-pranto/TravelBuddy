import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import UserContext from "../context/userContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { user, clearUser, getProfilePicUrl } = useContext(UserContext);

  const handleLogout = () => {
    logout();
    clearUser(); // Clear user data from UserContext
    navigate("/login");
  };

  // Use user data from UserContext if available, fallback to AuthContext
  const userData = user || currentUser;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          🌍 TravelBuddy
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/" ? "active" : ""}`} to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/about" ? "active" : ""}`} to="/about">
                About
              </Link>
            </li>
            {userData && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === "/createpost" ? "active" : ""}`} to="/createpost">
                    Create Post
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`} to="/dashboard">
                    Profile
                  </Link>
                </li>
              </>
            )}
          </ul>

          {!userData ? (
            <div className="d-flex">
              <Link className="btn btn-light mx-2" to="/login">
                Login
              </Link>
              <Link className="btn btn-outline-light mx-2" to="/signup">
                Signup
              </Link>
            </div>
          ) : (
            <div className="d-flex align-items-center">
              {/* User Profile Section */}
              <div className="dropdown">
                <button
                  className="btn btn-link text-light text-decoration-none dropdown-toggle d-flex align-items-center"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ border: 'none' }}
                >
                  <img
                    src={userData.profilePicUrl || getProfilePicUrl(userData.profilePic)}
                    alt="Profile"
                    className="rounded-circle me-2"
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      objectFit: 'cover',
                      border: '2px solid white'
                    }}
                  />
                  <span className="d-none d-md-inline">Hi, {userData.name}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/dashboard">
                      <i className="fas fa-user me-2"></i>
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/createpost">
                      <i className="fas fa-plus me-2"></i>
                      Create Post
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
              
              {/* Simple logout button for mobile/fallback */}
              <button 
                className="btn btn-outline-light ms-2 d-md-none" 
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;