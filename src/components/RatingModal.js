import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faTimes } from '@fortawesome/free-solid-svg-icons';

const RatingModal = ({ 
    show, 
    onHide, 
    userToRate, 
    onRatingSubmitted, 
    showAlert,
    existingRating = null 
}) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form with existing rating if available
    useEffect(() => {
        if (existingRating) {
            setRating(existingRating.rating);
            setReview(existingRating.review);
        } else {
            setRating(0);
            setReview('');
        }
    }, [existingRating, show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (rating === 0) {
            showAlert && showAlert('Please select a rating', 'warning');
            return;
        }

        if (review.trim().length < 10) {
            showAlert && showAlert('Review must be at least 10 characters long', 'warning');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/ratings/rate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token
                },
                body: JSON.stringify({
                    reviewee: userToRate._id,
                    rating: rating,
                    review: review.trim()
                })
            });

            const data = await response.json();

            if (data.success) {
                showAlert && showAlert(data.message, 'success');
                onRatingSubmitted && onRatingSubmitted();
                onHide();
                // Reset form
                setRating(0);
                setReview('');
            } else {
                showAlert && showAlert(data.error || 'Failed to submit rating', 'danger');
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            showAlert && showAlert('Error submitting rating', 'danger');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onHide();
            setRating(0);
            setReview('');
            setHoverRating(0);
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {existingRating ? 'Update Rating' : 'Rate User'}: {userToRate?.name}
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={handleClose}
                            disabled={isSubmitting}
                        ></button>
                    </div>
                    
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            {/* User Info */}
                            <div className="text-center mb-4">
                                <img
                                    src={userToRate?.profilePicUrl || "https://via.placeholder.com/80"}
                                    alt={userToRate?.name}
                                    className="rounded-circle mb-2"
                                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                />
                                <h6>{userToRate?.name}</h6>
                            </div>

                            {/* Star Rating */}
                            <div className="mb-3">
                                <label className="form-label">Rating *</label>
                                <div className="d-flex justify-content-center mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FontAwesomeIcon
                                            key={star}
                                            icon={faStar}
                                            size="2x"
                                            className={`mx-1 cursor-pointer ${
                                                star <= (hoverRating || rating) 
                                                    ? 'text-warning' 
                                                    : 'text-muted'
                                            }`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                        />
                                    ))}
                                </div>
                                <div className="text-center">
                                    <small className="text-muted">
                                        {rating === 1 && "Poor"}
                                        {rating === 2 && "Fair"}
                                        {rating === 3 && "Good"}
                                        {rating === 4 && "Very Good"}
                                        {rating === 5 && "Excellent"}
                                        {rating === 0 && "Select a rating"}
                                    </small>
                                </div>
                            </div>

                            {/* Review Text */}
                            <div className="mb-3">
                                <label className="form-label">Review *</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    placeholder="Share your experience with this traveler... (minimum 10 characters)"
                                    maxLength="500"
                                    disabled={isSubmitting}
                                />
                                <div className="d-flex justify-content-between mt-1">
                                    <small className="text-muted">
                                        Minimum 10 characters required
                                    </small>
                                    <small className="text-muted">
                                        {review.length}/500
                                    </small>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div className="modal-footer">
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={isSubmitting || rating === 0 || review.trim().length < 10}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    {existingRating ? 'Updating...' : 'Submitting...'}
                                </>
                            ) : (
                                existingRating ? 'Update Rating' : 'Submit Rating'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;