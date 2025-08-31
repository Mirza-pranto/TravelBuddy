// src/components/Navbar.js - Updated with Admin Dashboard link
import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import UserContext from "../context/userContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClipboardList, 
  faUserShield, 
  faChartLine 
} from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { user, clearUser, getProfilePicUrl } = useContext(UserContext);

  const handleLogout = () => {
    logout();
    clearUser();
    navigate("/login");
  };

  const userData = user || currentUser;
  const isAdmin = userData?.isAdmin;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success sticky-top">
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
                  <Link className={`nav-link ${location.pathname === "/my-requests" ? "active" : ""}`} to="/my-requests">
                    <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                    My Requests
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname.startsWith("/dashboard") ? "active" : ""}`} to="/dashboard">
                    Profile
                  </Link>
                </li>
                {isAdmin && (
                  <li className="nav-item">
                    <Link className={`nav-link ${location.pathname === "/admin" ? "active" : ""}`} to="/admin">
                      <FontAwesomeIcon icon={faUserShield} className="me-2" />
                      Admin Panel
                    </Link>
                  </li>
                )}
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
                  {isAdmin && (
                    <span className="badge bg-warning ms-2">Admin</span>
                  )}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  {isAdmin && (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/admin">
                          <FontAwesomeIcon icon={faUserShield} className="me-2" />
                          Admin Panel
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                    </>
                  )}
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
                  <li>
                    <Link className="dropdown-item" to="/my-requests">
                      <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                      My Requests
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