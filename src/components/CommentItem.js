import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import CommnetContext from '../context/Comments/noteContext';

const Commentitem = (props) => {
    const context = React.useContext(CommentContext);
    const { deleteComment } = context;
    const { comment, updateComment, showAlert, editable = true } = props;

    const handleActionClick = (e, action) => {
        e.preventDefault();
        e.stopPropagation();
        if (action === 'edit') {
            updateNote(comment);
        } else if (action === 'delete') {
            deleteNote(comment._id);
            if (showAlert) showAlert("comment deleted successfully", "success");
        }
    };

    return (
        <div className="col-md-4 my-3 ">
            <Link to={`/post/${comment._id}`} className="text-decoration-none " style={{ color: 'inherit' }}>
                <div className="card my-3 shadow-sm" style={{ minHeight: '100%' }}>
                    <div className="card-body d-flex flex-column bg-light">
                        <div className='d-flex align-items-start justify-content-between'>
                            <h5 className="card-title">{comment.title}</h5>
                            {editable && (
                                <div>
                                    <FontAwesomeIcon
                                        icon={faPenToSquare}
                                        className="text-success me-2 mx-2 cursor-pointer"
                                        onClick={(e) => handleActionClick(e, 'edit')}
                                    />
                                    <FontAwesomeIcon
                                        icon={faTrash}
                                        className="text-danger me-2 mx-2 cursor-pointer"
                                        onClick={(e) => handleActionClick(e, 'delete')}
                                    />
                                </div>
                            )}
                        </div>
                        <p className="card-text"><strong>Comment:</strong> {comment.text}</p>
                        
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default CommentItem;