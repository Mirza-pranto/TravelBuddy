import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
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

    // Format date if available
    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString() + ' at ' + new Date(date).toLocaleTimeString();
    };

    return (
        <div className="card my-2 shadow-sm">
            <div className="card-body">
                <div className='d-flex align-items-start justify-content-between'>
                    <div className="flex-grow-1">
                        <p className="card-text mb-2">{comment.text}</p>
                        {comment.createdAt && (
                            <small className="text-muted">
                                Posted on {formatDate(comment.createdAt)}
                            </small>
                        )}
                    </div>
                    {editable && (
                        <div className="ms-2">
                            <FontAwesomeIcon
                                icon={faPenToSquare}
                                className="text-success me-2 cursor-pointer"
                                onClick={(e) => handleActionClick(e, 'edit')}
                                title="Edit comment"
                            />
                            <FontAwesomeIcon
                                icon={faTrash}
                                className="text-danger cursor-pointer"
                                onClick={(e) => handleActionClick(e, 'delete')}
                                title="Delete comment"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentItem;