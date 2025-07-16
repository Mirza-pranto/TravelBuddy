import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faIdCard, faPen, faStar, faMapMarked, faCalendar, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const Dashboard = (props) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        bio: '',
        profilePic: ''
    });

    // Update editFormData when userData is loaded
    useEffect(() => {
        if (userData) {
            setEditFormData({
                name: userData.name || '',
                email: userData.email || '',
                phoneNumber: userData.phoneNumber || '',
                bio: userData.bio || '',
                profilePic: userData.profilePic || ''
            });
        }
    }, [userData]);

    // Handle form changes
    const handleEditChange = (e) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value
        });
    };

    // Handle form submission
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch("http://localhost:5000/api/auth/updateuser", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                },
                body: JSON.stringify(editFormData)
            });

            const data = await response.json();
            if (data.success) {
                setUserData({ ...userData, ...editFormData });
                setIsEditing(false);
                props.showAlert("Profile updated successfully", "success");
            } else {
                props.showAlert("Failed to update profile", "danger");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            props.showAlert("Error updating profile", "danger");
        }
    };

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
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h6 className="border-bottom pb-2">Personal Information</h6>
                                        {!isEditing ? (
                                            <button 
                                                className="btn btn-success btn-sm"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                <FontAwesomeIcon icon={faPen} className="me-2" />
                                                Edit Profile
                                            </button>
                                        ) : (
                                            <div>
                                                <button 
                                                    className="btn btn-success btn-sm me-2"
                                                    onClick={handleEditSubmit}
                                                >
                                                    <FontAwesomeIcon icon={faSave} className="me-2" />
                                                    Save
                                                </button>
                                                <button 
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setEditFormData({
                                                            name: userData.name,
                                                            email: userData.email,
                                                            phoneNumber: userData.phoneNumber,
                                                            bio: userData.bio,
                                                            profilePic: userData.profilePic
                                                        });
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} className="me-2" />
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <form onSubmit={handleEditSubmit}>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label">Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="name"
                                                        value={editFormData.name}
                                                        onChange={handleEditChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Email</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        name="email"
                                                        value={editFormData.email}
                                                        onChange={handleEditChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        className="form-control"
                                                        name="phoneNumber"
                                                        value={editFormData.phoneNumber}
                                                        onChange={handleEditChange}
                                                    />
                                                </div>
                                                <div className="col-md-12">
                                                    <label className="form-label">Profile Picture URL</label>
                                                    <input
                                                        type="url"
                                                        className="form-control"
                                                        name="profilePic"
                                                        value={editFormData.profilePic}
                                                        onChange={handleEditChange}
                                                    />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label">Bio</label>
                                                    <textarea
                                                        className="form-control"
                                                        name="bio"
                                                        value={editFormData.bio}
                                                        onChange={handleEditChange}
                                                        rows="3"
                                                    />
                                                </div>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <h6><FontAwesomeIcon icon={faUser} className="me-2" /> Name</h6>
                                                    <p>{userData.name}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <h6><FontAwesomeIcon icon={faEnvelope} className="me-2" /> Email</h6>
                                                    <p>{userData.email}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <h6><FontAwesomeIcon icon={faPhone} className="me-2" /> Phone</h6>
                                                    <p>{userData.phoneNumber || 'Not provided'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <h6><FontAwesomeIcon icon={faIdCard} className="me-2" /> Bio</h6>
                                                    <p>{userData.bio || 'No bio provided'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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