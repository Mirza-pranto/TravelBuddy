import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenToSquare, faStar } from '@fortawesome/free-solid-svg-icons';
import commentContext from '../context/comments/commentContext';

const CommentItem = ({ comment, updateComment, showAlert, editable = true }) => {
    const context = useContext(commentContext);
    const { deleteComment } = context;

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
        if (!profilePic) return "https://via.placeholder.com/40";
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
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Yesterday at ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays < 7) {
            return diffDays + ' days ago';
        } else {
            return dateObj.toLocaleDateString() + ' at ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    // Check if current user owns this comment (for edit/delete permissions)
    const currentUserId = localStorage.getItem('userId'); // You might need to implement this
    const canEdit = editable && comment.user && comment.user._id === currentUserId;

    return (
        <div className="card my-2 shadow-sm">
            <div className="card-body">
                {/* Commenter Info */}
                {comment.user && (
                    <div className="d-flex align-items-start mb-2">
                        <div className="clickable-profile" style={{ cursor: 'pointer' }}>
                            <img 
                                src={getProfilePicUrl(comment.user.profilePic)} 
                                alt={comment.user.name}
                                className="rounded-circle me-3"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                title="Click to view profile"
                            />
                        </div>
                        <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                                <h6 
                                    className="mb-0 me-2 fw-bold clickable-profile" 
                                    style={{ cursor: 'pointer' }}
                                    title="Click to view profile"
                                >
                                    {comment.user.name}
                                </h6>
                                {comment.user.averageRating > 0 && (
                                    <div className="d-flex align-items-center">
                                        <div className="me-1" style={{ fontSize: '12px' }}>
                                            {renderStars(comment.user.averageRating)}
                                        </div>
                                        <small className="text-muted">
                                            ({comment.user.totalRatings})
                                        </small>
                                    </div>
                                )}
                            </div>
                            <small className="text-muted">
                                {formatDate(comment.createdAt)}
                            </small>
                        </div>
                        {canEdit && (
                            <div className="ms-2">
                                <FontAwesomeIcon
                                    icon={faPenToSquare}
                                    className="text-success me-2 cursor-pointer"
                                    onClick={(e) => handleActionClick(e, 'edit')}
                                    title="Edit comment"
                                    style={{ fontSize: '14px' }}
                                />
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className="text-danger cursor-pointer"
                                    onClick={(e) => handleActionClick(e, 'delete')}
                                    title="Delete comment"
                                    style={{ fontSize: '14px' }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Comment Content */}
                <div className="ps-5">
                    <p className="card-text mb-0">{comment.text}</p>
                </div>
            </div>
        </div>
    );
};

export default CommentItem;