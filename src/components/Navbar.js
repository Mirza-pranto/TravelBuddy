// src/components/Navbar.js
import React from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext"; // adjust the path if needed

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  console.log("Current User:", currentUser);


  return (
    
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">TravelBuddy</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/" ? "active" : ""}`} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/about" ? "active" : ""}`} to="/about">About</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/createpost" ? "active" : ""}`} to="/createpost">Create Post</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`} to="/dashboard">Profile</Link>
            </li>
          </ul>

          {!currentUser ? (
            <div className="d-flex">
              <Link className="btn btn-light mx-2" to="/login">Login</Link>
              <Link className="btn btn-light mx-2" to="/signup">Signup</Link>
            </div>
          ) : (
            <div className="d-flex align-items-center">
              <span className="text-white me-3">Hi, {currentUser.name}</span>
              <button className="btn btn-light" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
