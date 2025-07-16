import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faIdCard, faPen, faStar, faMapMarked, faCalendar } from '@fortawesome/free-solid-svg-icons';

const Dashboard = (props) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch("http://localhost:5000/api/auth/getuser", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                }
            });

            const data = await response.json();
            setUserData(data);
        } catch (error) {
            console.error("Error fetching user data:", error);
            props.showAlert("Error loading profile", "danger");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="alert alert-danger text-center m-5" role="alert">
                No user data found. Please try logging in again.
            </div>
        );
    }

    return (
        <div className="container-fluid py-5 bg-light">
            <div className="row justify-content-center">
                {/* Sidebar */}
                <div className="col-md-3">
                    <div className="card shadow-sm">
                        <div className="card-body text-center">
                            <img
                                src={userData.profilePic || "https://via.placeholder.com/150"}
                                alt="Profile"
                                className="rounded-circle img-thumbnail mb-3"
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />
                            <h5 className="card-title">{userData.name}</h5>
                            <p className="text-muted">
                                <FontAwesomeIcon icon={faMapMarked} className="me-2" />
                                Travel Enthusiast
                            </p>
                            <button className="btn btn-success w-100 mb-3">
                                <FontAwesomeIcon icon={faPen} className="me-2" />
                                Edit Profile
                            </button>
                            
                            {/* Quick Stats */}
                            <div className="list-group mt-4">
                                <div className="list-group-item">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>Tours</span>
                                        <span className="badge bg-success rounded-pill">{userData.totalTours || 0}</span>
                                    </div>
                                </div>
                                <div className="list-group-item">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>Rating</span>
                                        <span>
                                            <FontAwesomeIcon icon={faStar} className="text-warning me-1" />
                                            {userData.averageRating || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-md-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white">
                            <ul className="nav nav-tabs card-header-tabs">
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('profile')}
                                    >
                                        Profile
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'tours' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('tours')}
                                    >
                                        Tours
                                    </button>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="card-body">
                            {activeTab === 'profile' ? (
                                <>
                                    <h6 className="border-bottom pb-2 mb-4">Personal Information</h6>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center">
                                                <FontAwesomeIcon icon={faEnvelope} className="text-success me-2" />
                                                <div>
                                                    <small className="text-muted d-block">Email</small>
                                                    <span>{userData.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center">
                                                <FontAwesomeIcon icon={faPhone} className="text-success me-2" />
                                                <div>
                                                    <small className="text-muted d-block">Phone</small>
                                                    <span>{userData.phoneNumber || 'Not provided'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center">
                                                <FontAwesomeIcon icon={faIdCard} className="text-success me-2" />
                                                <div>
                                                    <small className="text-muted d-block">NID</small>
                                                    <span>{userData.nidNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center">
                                                <FontAwesomeIcon icon={faCalendar} className="text-success me-2" />
                                                <div>
                                                    <small className="text-muted d-block">Member Since</small>
                                                    <span>{new Date(userData.date).getFullYear()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <h6 className="border-bottom pb-2 my-4">Bio</h6>
                                    <p className="text-muted">{userData.bio || 'No bio provided'}</p>
                                </>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Destination</th>
                                                <th>Date</th>
                                                <th>Type</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {userData.pastTours && userData.pastTours.length > 0 ? (
                                                userData.pastTours.map((tour, index) => (
                                                    <tr key={index}>
                                                        <td>{tour.destination}</td>
                                                        <td>{new Date(tour.startDate).toLocaleDateString()}</td>
                                                        <td>
                                                            <span className="badge bg-info">{tour.travelType}</span>
                                                        </td>
                                                        <td>
                                                            <span className="badge bg-success">Completed</span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center text-muted">
                                                        No tours yet
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;