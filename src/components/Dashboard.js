import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faIdCard, faPen, faStar, faMapMarked, faCalendar, faSave, faTimes, faCamera, faFlag } from '@fortawesome/free-solid-svg-icons';
import UserContext from '../context/userContext';

const Dashboard = (props) => {
    const context = useContext(UserContext);
    const { user, updateUser, refreshUser, getProfilePicUrl } = context;
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        bio: ''
    });
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [profilePicPreview, setProfilePicPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Update editFormData when user data is loaded
    useEffect(() => {
        if (user) {
            setEditFormData({
                name: user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                bio: user.bio || ''
            });
            setLoading(false);
        } else {
            // If no user data, try to refresh from server
            const token = localStorage.getItem('token');
            if (token) {
                refreshUser().then((success) => {
                    if (!success) {
                        navigate('/login');
                    }
                    setLoading(false);
                });
            } else {
                navigate('/login');
                setLoading(false);
            }
        }
    }, [user, navigate, refreshUser]);

    // Handle form changes
    const handleEditChange = (e) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                props.showAlert("File size should be less than 5MB", "danger");
                return;
            }
            
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                props.showAlert("Please select a valid image file (JPEG, PNG, GIF, WEBP)", "danger");
                return;
            }
            
            setProfilePicFile(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadProfilePic = async () => {
        if (!profilePicFile) return null;
        
        const formData = new FormData();
        formData.append('profilePic', profilePicFile);
        
        try {
            const response = await fetch("http://localhost:5000/api/auth/upload-profile-pic", {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            if (result.success) {
                return result.filePath;
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };

    // Handle form submission
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        
        try {
            let profilePicPath = user.profilePic; // Keep existing if no new file
            
            // Upload new profile picture if selected
            if (profilePicFile) {
                profilePicPath = await uploadProfilePic();
            }

            const token = localStorage.getItem('token');
            const response = await fetch("http://localhost:5000/api/auth/updateuser", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                },
                body: JSON.stringify({
                    ...editFormData,
                    profilePic: profilePicPath
                })
            });

            const data = await response.json();
            if (data.success) {
                const updatedUserData = { 
                    ...user, 
                    ...editFormData, 
                    profilePic: profilePicPath 
                };
                
                // Update user context
                updateUser(updatedUserData);
                
                // Also update localStorage for auth context compatibility
                localStorage.setItem('user', JSON.stringify(updatedUserData));
                
                setIsEditing(false);
                setProfilePicFile(null);
                setProfilePicPreview(null);
                props.showAlert("Profile updated successfully", "success");
            } else {
                props.showAlert(data.error || "Failed to update profile", "danger");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            props.showAlert("Error updating profile", "danger");
        } finally {
            setUploading(false);
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

    if (!user) {
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
                            <div className="position-relative d-inline-block">
                                <img
                                    src={profilePicPreview || (user.profilePicUrl || getProfilePicUrl(user.profilePic))}
                                    alt="Profile"
                                    className="rounded-circle img-thumbnail mb-3"
                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                />
                                {isEditing && (
                                    <div className="position-absolute bottom-0 end-0">
                                        <label htmlFor="profilePicInput" className="btn btn-success btn-sm rounded-circle" style={{ width: '40px', height: '40px' }}>
                                            <FontAwesomeIcon icon={faCamera} />
                                        </label>
                                        <input
                                            type="file"
                                            id="profilePicInput"
                                            className="d-none"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                )}
                            </div>
                            <h5 className="card-title">{user.name}</h5>
                            <p className="text-muted">
                                <FontAwesomeIcon icon={faMapMarked} className="me-2" />
                                Travel Enthusiast
                            </p>
                            
                            {/* Quick Stats */}
                            <div className="list-group mt-4">
                                <div className="list-group-item">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>Tours</span>
                                        <span className="badge bg-success rounded-pill">{user.totalTours || 0}</span>
                                    </div>
                                </div>
                                <div className="list-group-item">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>Rating</span>
                                        <span>
                                            <FontAwesomeIcon icon={faStar} className="text-warning me-1" />
                                            {user.averageRating || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="list-group mt-4">
                                <button 
                                    className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('profile')}
                                >
                                    <FontAwesomeIcon icon={faUser} className="me-2" />
                                    Profile
                                </button>
                                <button 
                                    className={`list-group-item list-group-item-action ${activeTab === 'tours' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('tours')}
                                >
                                    <FontAwesomeIcon icon={faMapMarked} className="me-2" />
                                    Tours
                                </button>
                                <button 
                                    className="list-group-item list-group-item-action"
                                    onClick={() => navigate('/my-reports')}
                                >
                                    <FontAwesomeIcon icon={faFlag} className="me-2" />
                                    My Reports
                                </button>
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
                                                    disabled={uploading}
                                                >
                                                    {uploading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FontAwesomeIcon icon={faSave} className="me-2" />
                                                            Save
                                                        </>
                                                    )}
                                                </button>
                                                <button 
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setProfilePicFile(null);
                                                        setProfilePicPreview(null);
                                                        setEditFormData({
                                                            name: user.name,
                                                            email: user.email,
                                                            phoneNumber: user.phoneNumber,
                                                            bio: user.bio
                                                        });
                                                    }}
                                                    disabled={uploading}
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
                                                    <p>{user.name}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <h6><FontAwesomeIcon icon={faEnvelope} className="me-2" /> Email</h6>
                                                    <p>{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <h6><FontAwesomeIcon icon={faPhone} className="me-2" /> Phone</h6>
                                                    <p>{user.phoneNumber || 'Not provided'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <h6><FontAwesomeIcon icon={faIdCard} className="me-2" /> Bio</h6>
                                                    <p>{user.bio || 'No bio provided'}</p>
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
                                            {user.pastTours && user.pastTours.length > 0 ? (
                                                user.pastTours.map((tour, index) => (
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