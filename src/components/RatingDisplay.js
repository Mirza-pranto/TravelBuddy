import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faStar, 
    faUser, 
    faCalendar, 
    faEdit, 
    faTrash,
    faSpinner 
} from '@fortawesome/free-solid-svg-icons';
import UserContext from '../context/userContext';
import RatingModal from './RatingModal';

const RatingDisplay = ({ userId, showAlert }) => {
    const context = useContext(UserContext);
    const { user } = context;
    
    const [ratings, setRatings] = useState([]);
    const [ratingStats, setRatingStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [myRating, setMyRating] = useState(null);
    const [userToRate, setUserToRate] = useState(null);

    // Fetch ratings and stats
    const fetchRatings = async () => {
        try {
            setLoading(true);
            
            // Fetch user ratings
            const ratingsResponse = await fetch(`http://localhost:5000/api/ratings/user/${userId}`);
            if (ratingsResponse.ok) {
                const ratingsData = await ratingsResponse.json();
                setRatings(ratingsData);
            }

            // Fetch rating stats
            const statsResponse = await fetch(`http://localhost:5000/api/ratings/stats/${userId}`);
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setRatingStats(statsData);
            }

            // Fetch user's own rating if logged in
            if (user && user._id !== userId) {
                const myRatingResponse = await fetch(`http://localhost:5000/api/ratings/my-rating/${userId}`, {
                    headers: {
                        'auth-token': localStorage.getItem('token')
                    }
                });
                if (myRatingResponse.ok) {
                    const myRatingData = await myRatingResponse.json();
                    setMyRating(myRatingData.hasRated ? myRatingData.rating : null);
                }
            }

            // Fetch user info for rating modal
            const userResponse = await fetch(`http://localhost:5000/api/auth/getuser/${userId}`);
            if (userResponse.ok) {
                const userData = await userResponse.json();
                setUserToRate(userData);
            }

        } catch (error) {
            console.error('Error fetching ratings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchRatings();
        }
    }, [userId, user]);

    const renderStars = (rating, size = '1x') => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<FontAwesomeIcon key={i} icon={faStar} size={size} className="text-warning" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<FontAwesomeIcon key={i} icon={faStar} size={size} className="text-warning" style={{ opacity: 0.5 }} />);
            } else {
                stars.push(<FontAwesomeIcon key={i} icon={faStar} size={size} className="text-muted" />);
            }
        }
        return stars;
    };

    const handleRateUser = () => {
        if (!user) {
            showAlert && showAlert('Please log in to rate users', 'warning');
            return;
        }
        setShowRatingModal(true);
    };

    const handleRatingSubmitted = () => {
        fetchRatings(); // Refresh ratings after submission
    };

    const handleDeleteRating = async (ratingId) => {
        if (!window.confirm('Are you sure you want to delete your rating?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/ratings/${ratingId}`, {
                method: 'DELETE',
                headers: {
                    'auth-token': localStorage.getItem('token')
                }
            });

            const data = await response.json();
            if (data.success) {
                showAlert && showAlert('Rating deleted successfully', 'success');
                fetchRatings(); // Refresh ratings
            } else {
                showAlert && showAlert(data.error || 'Failed to delete rating', 'danger');
            }
        } catch (error) {
            console.error('Error deleting rating:', error);
            showAlert && showAlert('Error deleting rating', 'danger');
        }
    };

    if (loading) {
        return (
            <div className="text-center py-4">
                <FontAwesomeIcon icon={faSpinner} spin className="text-primary" />
                <p className="mt-2 text-muted">Loading ratings...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Rating Stats */}
            {ratingStats && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h6 className="card-title">Rating Overview</h6>
                        <div className="row align-items-center">
                            <div className="col-md-4 text-center">
                                <h2 className="text-warning mb-0">
                                    {ratingStats.averageRating || '0.0'}
                                </h2>
                                <div className="mb-2">
                                    {renderStars(parseFloat(ratingStats.averageRating || 0), 'lg')}
                                </div>
                                <small className="text-muted">
                                    Based on {ratingStats.totalRatings} review{ratingStats.totalRatings !== 1 ? 's' : ''}
                                </small>
                            </div>
                            <div className="col-md-8">
                                {/* Rating Distribution */}
                                {Object.entries(ratingStats.ratingDistribution).reverse().map(([star, count]) => (
                                    <div key={star} className="d-flex align-items-center mb-1">
                                        <span className="me-2" style={{ minWidth: '20px' }}>{star}</span>
                                        <FontAwesomeIcon icon={faStar} className="text-warning me-2" />
                                        <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                                            <div 
                                                className="progress-bar bg-warning" 
                                                style={{ 
                                                    width: `${ratingStats.totalRatings > 0 ? (count / ratingStats.totalRatings) * 100 : 0}%` 
                                                }}
                                            ></div>
                                        </div>
                                        <small className="text-muted" style={{ minWidth: '30px' }}>({count})</small>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rate User Button */}
                        {user && user._id !== userId && (
                            <div className="text-center mt-3">
                                <button 
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={handleRateUser}
                                >
                                    {myRating ? 'Update Your Rating' : 'Rate This User'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Individual Ratings */}
            <div className="card">
                <div className="card-header">
                    <h6 className="mb-0">Reviews ({ratings.length})</h6>
                </div>
                <div className="card-body">
                    {ratings.length === 0 ? (
                        <div className="text-center py-4">
                            <FontAwesomeIcon icon={faStar} size="3x" className="text-muted mb-3" />
                            <h6 className="text-muted">No reviews yet</h6>
                            <p className="text-muted">Be the first to leave a review!</p>
                        </div>
                    ) : (
                        ratings.map((rating) => (
                            <div key={rating._id} className="border-bottom pb-3 mb-3 last:border-0">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={rating.reviewer.profilePic ? 
                                                `http://localhost:5000${rating.reviewer.profilePic}` : 
                                                "https://via.placeholder.com/40"}
                                            alt={rating.reviewer.name}
                                            className="rounded-circle me-3"
                                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <h6 className="mb-0">{rating.reviewer.name}</h6>
                                            <div className="mb-1">
                                                {renderStars(rating.rating)}
                                            </div>
                                            <small className="text-muted">
                                                <FontAwesomeIcon icon={faCalendar} className="me-1" />
                                                {new Date(rating.date).toLocaleDateString()}
                                            </small>
                                        </div>
                                    </div>

                                    {/* Edit/Delete buttons for own rating */}
                                    {user && user._id === rating.reviewer._id && (
                                        <div className="dropdown">
                                            <button 
                                                className="btn btn-sm btn-outline-secondary"
                                                type="button"
                                                data-bs-toggle="dropdown"
                                            >
                                                ⋮
                                            </button>
                                            <ul className="dropdown-menu">
                                                <li>
                                                    <button 
                                                        className="dropdown-item"
                                                        onClick={handleRateUser}
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} className="me-2" />
                                                        Edit
                                                    </button>
                                                </li>
                                                <li>
                                                    <button 
                                                        className="dropdown-item text-danger"
                                                        onClick={() => handleDeleteRating(rating._id)}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="me-2" />
                                                        Delete
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <p className="mb-0" style={{ paddingLeft: '55px' }}>
                                    {rating.review}
                                </p>

                                {/* Tour Related */}
                                {rating.tourRelated && (
                                    <div className="mt-2" style={{ paddingLeft: '55px' }}>
                                        <small className="text-muted">
                                            Related to tour: {rating.tourRelated.title} - {rating.tourRelated.destination}
                                        </small>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Rating Modal */}
            <RatingModal
                show={showRatingModal}
                onHide={() => setShowRatingModal(false)}
                userToRate={userToRate}
                onRatingSubmitted={handleRatingSubmitted}
                showAlert={showAlert}
                existingRating={myRating}
            />
        </div>
    );
};

export default RatingDisplay;