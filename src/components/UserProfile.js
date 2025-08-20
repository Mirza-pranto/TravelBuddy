import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUser, 
    faEnvelope, 
    faPhone, 
    faStar, 
    faMapMarkerAlt, 
    faCalendar,
    faSpinner,
    faArrowLeft,
    faUserCircle,
    faIdCard
} from '@fortawesome/free-solid-svg-icons';
import RatingDisplay from './RatingDisplay';

const UserProfile = ({ showAlert }) => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [userNotes, setUserNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');

    // Fetch user profile data
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                
                // Fetch user profile
                const userResponse = await fetch(`http://localhost:5000/api/auth/getuser/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': localStorage.getItem('token')
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUserProfile(userData);
                } else {
                    showAlert && showAlert("User not found", "error");
                    navigate('/');
                    return;
                }

                // Fetch user's public notes/tours
                const notesResponse = await fetch(`http://localhost:5000/api/notes/user/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (notesResponse.ok) {
                    const notesData = await notesResponse.json();
                    setUserNotes(notesData);
                }

            } catch (error) {
                console.error('Error fetching user profile:', error);
                showAlert && showAlert("Error loading user profile", "error");
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserProfile();
        }
    }, [userId, navigate, showAlert]);

    // Helper functions
    const getProfilePicUrl = (profilePic) => {
        if (!profilePic) return "https://via.placeholder.com/150?text=User";
        if (profilePic.startsWith('http')) return profilePic;
        return `http://localhost:5000${profilePic}`;
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-warning" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-warning" style={{ opacity: 0.5 }} />);
            } else {
                stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-muted" />);
            }
        }
        return stars;
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000${imagePath}`;
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary mb-3" />
                <h4>Loading user profile...</h4>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="container mt-5 text-center">
                <h4>User not found</h4>
                <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {/* Back Button */}
            <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Back
            </button>

            <div className="row">
                {/* Profile Info Sidebar */}
                <div className="col-lg-4 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-body text-center">
                            <img
                                src={getProfilePicUrl(userProfile.profilePic)}
                                alt={userProfile.name}
                                className="rounded-circle img-thumbnail mb-3"
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/150?text=User";
                                }}
                            />
                            
                            <h4 className="card-title mb-2">{userProfile.name}</h4>
                            
                            {/* Rating */}
                            <div className="mb-3">
                                {userProfile.averageRating > 0 ? (
                                    <div className="d-flex align-items-center justify-content-center">
                                        <div className="me-2">
                                            {renderStars(userProfile.averageRating)}
                                        </div>
                                        <span className="text-muted">
                                            {userProfile.averageRating.toFixed(1)} ({userProfile.totalRatings} reviews)
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-muted">New traveler - No ratings yet</span>
                                )}
                            </div>

                            {/* Bio */}
                            {userProfile.bio && (
                                <div className="mb-3">
                                    <p className="text-muted" style={{ fontSize: '14px' }}>
                                        {userProfile.bio}
                                    </p>
                                </div>
                            )}

                            {/* Join Date */}
                            <div className="mb-3">
                                <small className="text-muted">
                                    <FontAwesomeIcon icon={faCalendar} className="me-1" />
                                    Member since {new Date(userProfile.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </small>
                            </div>

                            {/* Contact Info (if available) */}
                            <div className="list-group list-group-flush mt-3">
                                {userProfile.email && (
                                    <div className="list-group-item bg-transparent border-0 px-0">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-primary me-2" />
                                        <small className="text-muted">{userProfile.email}</small>
                                    </div>
                                )}
                                {userProfile.phoneNumber && (
                                    <div className="list-group-item bg-transparent border-0 px-0">
                                        <FontAwesomeIcon icon={faPhone} className="text-success me-2" />
                                        <small className="text-muted">{userProfile.phoneNumber}</small>
                                    </div>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="row mt-4">
                                <div className="col-6">
                                    <div className="bg-light rounded p-2">
                                        <h5 className="mb-0 text-primary">{userNotes.length}</h5>
                                        <small className="text-muted">Tours Posted</small>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="bg-light rounded p-2">
                                        <h5 className="mb-0 text-success">{userProfile.pastTours?.length || 0}</h5>
                                        <small className="text-muted">Tours Completed</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white">
                            <ul className="nav nav-tabs card-header-tabs">
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('profile')}
                                    >
                                        <FontAwesomeIcon icon={faUser} className="me-1" />
                                        About
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'tours' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('tours')}
                                    >
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                        Tours ({userNotes.length})
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'ratings' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('ratings')}
                                    >
                                        <FontAwesomeIcon icon={faStar} className="me-1" />
                                        Reviews ({userProfile.totalRatings || 0})
                                    </button>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="card-body">
                            {activeTab === 'profile' ? (
                                <div>
                                    <h5 className="mb-4">About {userProfile.name}</h5>
                                    
                                    {/* User Details */}
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <h6 className="text-muted">
                                                <FontAwesomeIcon icon={faUserCircle} className="me-2" />
                                                Full Name
                                            </h6>
                                            <p>{userProfile.name}</p>
                                        </div>
                                        
                                        <div className="col-md-6 mb-3">
                                            <h6 className="text-muted">
                                                <FontAwesomeIcon icon={faCalendar} className="me-2" />
                                                Joined
                                            </h6>
                                            <p>{new Date(userProfile.date).toLocaleDateString()}</p>
                                        </div>
                                        
                                        {userProfile.averageRating > 0 && (
                                            <div className="col-md-6 mb-3">
                                                <h6 className="text-muted">
                                                    <FontAwesomeIcon icon={faStar} className="me-2" />
                                                    Rating
                                                </h6>
                                                <div className="d-flex align-items-center">
                                                    {renderStars(userProfile.averageRating)}
                                                    <span className="ms-2">
                                                        {userProfile.averageRating.toFixed(1)} ({userProfile.totalRatings} reviews)
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="col-md-6 mb-3">
                                            <h6 className="text-muted">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                                                Travel Experience
                                            </h6>
                                            <p>
                                                {userNotes.length} tours posted, {userProfile.pastTours?.length || 0} completed
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bio Section */}
                                    {userProfile.bio && (
                                        <div className="mt-4">
                                            <h6 className="text-muted mb-3">Bio</h6>
                                            <div className="bg-light rounded p-3">
                                                <p className="mb-0">{userProfile.bio}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : activeTab === 'tours' ? (
                                <div>
                                    <h5 className="mb-4">Tours by {userProfile.name}</h5>
                                    
                                    {userNotes.length === 0 ? (
                                        <div className="text-center py-5">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} size="3x" className="text-muted mb-3" />
                                            <h6 className="text-muted">No tours posted yet</h6>
                                            <p className="text-muted">This user hasn't shared any travel plans yet.</p>
                                        </div>
                                    ) : (
                                        <div className="row">
                                            {userNotes.map((note) => (
                                                <div key={note._id} className="col-md-6 mb-4">
                                                    <div className="card h-100 shadow-sm hover-shadow">
                                                        {/* Tour Image */}
                                                        <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                                                            {note.featuredImage || (note.images && note.images.length > 0) ? (
                                                                <img 
                                                                    src={getImageUrl(note.featuredImage || note.images[0])} 
                                                                    alt={note.title}
                                                                    className="card-img-top h-100"
                                                                    style={{ objectFit: 'cover', width: '100%' }}
                                                                    onError={(e) => {
                                                                        e.target.onerror = null; 
                                                                        e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="d-flex align-items-center justify-content-center h-100 bg-light text-muted">
                                                                    <FontAwesomeIcon icon={faMapMarkerAlt} size="2x" />
                                                                </div>
                                                            )}
                                                            
                                                            <span className={`badge position-absolute top-0 end-0 m-2 ${
                                                                note.travelType === 'Adventure' ? 'bg-danger' :
                                                                note.travelType === 'Relax' ? 'bg-info' :
                                                                note.travelType === 'Cultural' ? 'bg-primary' :
                                                                note.travelType === 'Backpacking' ? 'bg-warning' : 'bg-secondary'
                                                            }`}>
                                                                {note.travelType}
                                                            </span>
                                                        </div>

                                                        <div className="card-body">
                                                            <h6 className="card-title">{note.title}</h6>
                                                            
                                                            <p className="text-muted mb-2">
                                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                                                {note.destination}
                                                            </p>
                                                            
                                                            <p className="text-success mb-2">
                                                                <strong>${note.budget}</strong>
                                                            </p>
                                                            
                                                            <p className="text-muted small mb-3">
                                                                <FontAwesomeIcon icon={faCalendar} className="me-1" />
                                                                {new Date(note.startDate).toLocaleDateString()} - {new Date(note.endDate).toLocaleDateString()}
                                                            </p>

                                                            <p className="card-text small text-muted" style={{ 
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden'
                                                            }}>
                                                                {note.description}
                                                            </p>

                                                            <button 
                                                                className="btn btn-primary btn-sm w-100"
                                                                onClick={() => navigate(`/post/${note._id}`)}
                                                            >
                                                                View Details
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Ratings Tab
                                <div>
                                    <h5 className="mb-4">Reviews for {userProfile.name}</h5>
                                    <RatingDisplay 
                                        userId={userId} 
                                        showAlert={showAlert}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;