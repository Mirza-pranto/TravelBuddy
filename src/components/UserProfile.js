import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faMapMarkerAlt, faCalendar, faUser, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import Noteitem from './Noteitem';

const UserProfile = ({ showAlert }) => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [userNotes, setUserNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                
                // Fetch user details
                const userResponse = await fetch(`http://localhost:5000/api/auth/getuser/${userId}`);
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUser(userData);
                }

                // Fetch user's notes
                const notesResponse = await fetch(`http://localhost:5000/api/notes/user/${userId}`);
                if (notesResponse.ok) {
                    const notesData = await notesResponse.json();
                    setUserNotes(notesData);
                }

            } catch (error) {
                console.error('Error fetching user profile:', error);
                showAlert && showAlert('Error loading user profile', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserProfile();
        }
    }, [userId, showAlert]);

    const getProfilePicUrl = (profilePic) => {
        if (!profilePic) return "https://via.placeholder.com/150";
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

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h3 className="mt-3">Loading profile...</h3>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mt-5 text-center">
                <h3>User not found</h3>
                <p>The user profile you're looking for doesn't exist.</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {/* Profile Header */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4 text-center">
                            <img 
                                src={getProfilePicUrl(user.profilePic)} 
                                alt={user.name}
                                className="rounded-circle img-fluid mb-3"
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />
                            <h3 className="mb-2">{user.name}</h3>
                            
                            {/* Rating */}
                            {user.averageRating > 0 ? (
                                <div className="mb-2">
                                    <div className="d-flex justify-content-center align-items-center mb-1">
                                        {renderStars(user.averageRating)}
                                    </div>
                                    <p className="text-muted mb-0">
                                        {user.averageRating.toFixed(1)} out of 5 ({user.totalRatings} reviews)
                                    </p>
                                </div>
                            ) : (
                                <p className="text-muted">New traveler - No reviews yet</p>
                            )}

                            {/* Member since */}
                            <p className="text-muted">
                                <FontAwesomeIcon icon={faCalendar} className="me-1" />
                                Member since {new Date(user.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                            </p>
                        </div>

                        <div className="col-md-8">
                            <div className="row">
                                <div className="col-12">
                                    <h5 className="mb-3">
                                        <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                                        About {user.name.split(' ')[0]}
                                    </h5>
                                    
                                    {user.bio ? (
                                        <p className="lead" style={{ lineHeight: '1.6' }}>{user.bio}</p>
                                    ) : (
                                        <p className="text-muted">This traveler hasn't added a bio yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="row mt-4">
                                <div className="col-md-6">
                                    <div className="card bg-light">
                                        <div className="card-body text-center">
                                            <h4 className="text-success">{userNotes.length}</h4>
                                            <p className="mb-0">Tour Posts</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card bg-light">
                                        <div className="card-body text-center">
                                            <h4 className="text-info">{user.pastTours ? user.pastTours.length : 0}</h4>
                                            <p className="mb-0">Completed Tours</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact section (only show email if public) */}
                            <div className="mt-4">
                                <h6>
                                    <FontAwesomeIcon icon={faEnvelope} className="me-2 text-secondary" />
                                    Contact Information
                                </h6>
                                <p className="text-muted">
                                    Connect with {user.name.split(' ')[0]} through the comment section on their posts
                                    or use the "Request to Join Tour" feature.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Travel Stats */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Travel Statistics</h5>
                </div>
                <div className="card-body">
                    <div className="row text-center">
                        <div className="col-md-3">
                            <div className="border-end">
                                <h4 className="text-primary">{userNotes.length}</h4>
                                <p className="text-muted mb-0">Tours Created</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="border-end">
                                <h4 className="text-success">{user.totalRatings}</h4>
                                <p className="text-muted mb-0">Reviews Received</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="border-end">
                                <h4 className="text-warning">
                                    {user.averageRating > 0 ? user.averageRating.toFixed(1) : 'N/A'}
                                </h4>
                                <p className="text-muted mb-0">Average Rating</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <h4 className="text-info">{user.pastTours ? user.pastTours.length : 0}</h4>
                            <p className="text-muted mb-0">Tours Completed</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* User's Tour Posts */}
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                        {user.name.split(' ')[0]}'s Tour Posts
                    </h5>
                </div>
                <div className="card-body">
                    {userNotes.length > 0 ? (
                        <div className="row">
                            {userNotes.map(note => (
                                <Noteitem 
                                    key={note._id} 
                                    note={note} 
                                    editable={false}
                                    showAlert={showAlert}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-muted mb-3" size="3x" />
                            <h5 className="text-muted">No tour posts yet</h5>
                            <p className="text-muted">
                                {user.name.split(' ')[0]} hasn't created any tour posts yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;