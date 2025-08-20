import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenToSquare, faStar } from '@fortawesome/free-solid-svg-icons';
import commentContext from '../context/comments/commentContext';
import UserContext from '../context/userContext'; // Import UserContext to get current user

const CommentItem = ({ comment, updateComment, showAlert, editable = true }) => {
    const context = useContext(commentContext);
    const userContext = useContext(UserContext);
    const { deleteComment } = context;
    const { user: currentUser } = userContext; // Get current logged-in user
    const navigate = useNavigate(); // Add navigation hook

    // Handle profile click navigation
    const handleProfileClick = () => {
        if (comment.user && comment.user._id) {
            navigate(`/profile/${comment.user._id}`);
        }
    };

    const handleActionClick = async (e, action) => {
        e.preventDefault();
        e.stopPropagation();
        if (action === 'edit') {
            updateComment(comment);
        } else if (action === 'delete') {
            const success = await deleteComment(comment._id);
            if (success && showAlert) {
                showAlert("Comment deleted successfully", "success");
            } else if (!success && showAlert) {
                showAlert("Failed to delete comment", "error");
            }
        }
    };

    // Helper function to get profile picture URL
    const getProfilePicUrl = (profilePic) => {
        if (!profilePic) return "https://via.placeholder.com/40?text=U";
        if (profilePic.startsWith('http')) return profilePic;
        return `http://localhost:5000${profilePic}`;
    };

    // Helper function to render star rating
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

    // Format date if available
    const formatDate = (date) => {
        if (!date) return '';
        const dateObj = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - dateObj);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) {
            return 'Just now';
        } else if (diffMinutes < 60) {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffDays === 1) {
            return 'Yesterday at ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else {
            return dateObj.toLocaleDateString() + ' at ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    // Check if current user owns this comment (for edit/delete permissions)
    const canEdit = editable && comment.user && currentUser && comment.user._id === currentUser._id;

    // Handle case where user information might not be populated
    const commentUser = comment.user || {
        name: 'Unknown User',
        profilePic: null,
        averageRating: 0,
        totalRatings: 0
    };

    return (
        <div className="card my-3 shadow-sm border-0">
            <div className="card-body p-3">
                {/* Commenter Info */}
                <div className="d-flex align-items-start">
                    <div className="clickable-profile me-3" style={{ cursor: 'pointer' }} onClick={handleProfileClick}>
                        <img 
                            src={getProfilePicUrl(commentUser.profilePic)} 
                            alt={commentUser.name}
                            className="rounded-circle border"
                            style={{ 
                                width: '45px', 
                                height: '45px', 
                                objectFit: 'cover',
                                transition: 'transform 0.2s ease'
                            }}
                            title="Click to view profile"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/45?text=U&bg=e9ecef&color=6c757d";
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        />
                    </div>
                    
                    <div className="flex-grow-1">
                        {/* User name and rating */}
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="d-flex align-items-center">
                                <h6 
                                    className="mb-0 me-2 fw-bold clickable-profile text-primary" 
                                    style={{ cursor: 'pointer' }}
                                    title="Click to view profile"
                                    onClick={handleProfileClick}
                                >
                                    {commentUser.name}
                                </h6>
                                {commentUser.averageRating > 0 && (
                                    <div className="d-flex align-items-center">
                                        <div className="me-1" style={{ fontSize: '12px' }}>
                                            {renderStars(commentUser.averageRating)}
                                        </div>
                                        <small className="text-muted">
                                            ({commentUser.totalRatings})
                                        </small>
                                    </div>
                                )}
                            </div>
                            
                            {/* Action buttons */}
                            {canEdit && (
                                <div className="d-flex gap-2">
                                    <FontAwesomeIcon
                                        icon={faPenToSquare}
                                        className="text-success cursor-pointer"
                                        onClick={(e) => handleActionClick(e, 'edit')}
                                        title="Edit comment"
                                        style={{ 
                                            fontSize: '14px',
                                            transition: 'color 0.2s ease'
                                        }}
                                        onMouseOver={(e) => e.target.style.color = '#198754'}
                                        onMouseOut={(e) => e.target.style.color = '#28a745'}
                                    />
                                    <FontAwesomeIcon
                                        icon={faTrash}
                                        className="text-danger cursor-pointer"
                                        onClick={(e) => handleActionClick(e, 'delete')}
                                        title="Delete comment"
                                        style={{ 
                                            fontSize: '14px',
                                            transition: 'color 0.2s ease'
                                        }}
                                        onMouseOver={(e) => e.target.style.color = '#dc3545'}
                                        onMouseOut={(e) => e.target.style.color = '#e74c3c'}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Time stamp */}
                        <small className="text-muted mb-2 d-block">
                            {formatDate(comment.createdAt)}
                        </small>

                        {/* Comment Content */}
                        <div className="comment-text">
                            <p className="mb-0" style={{ lineHeight: '1.5', color: '#495057' }}>
                                {comment.text}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentItem;