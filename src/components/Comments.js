import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import commentContext from "../context/comments/commentContext";
import CommentItem from './CommentItem';
import AddComment from './AddComment';

const Comments = ({ noteId, showAlert }) => {
    const context = useContext(commentContext);
    const navigate = useNavigate();
    
    // All hooks must be called at the top level, before any conditional logic
    const ref = useRef(null);
    const refClose = useRef(null);
    const [comment, setComment] = useState({
        id: "",
        text: ""
    });

    useEffect(() => {
        if (context && localStorage.getItem('token')) {
            if (noteId) {
                context.getComments(noteId);
            }
        } else if (!localStorage.getItem('token')) {
            navigate('/login');
        }
        // eslint-disable-next-line
    }, [noteId, context, navigate]);

    // Add error handling for undefined context AFTER all hooks
    if (!context) {
        return (
            <div className="alert alert-danger" role="alert">
                Comment context not available. Please make sure CommentState provider is wrapped around this component.
            </div>
        );
    }

    const { comments = [], getComments, editComment } = context;

    const updateComment = (currentComment) => {
        ref.current.click();
        setComment({
            id: currentComment._id,
            text: currentComment.text
        });
    };

    const handleClick = async (e) => {
        e.preventDefault();
        const success = await editComment(comment.id, comment.text);
        if (success) {
            refClose.current.click();
            showAlert && showAlert("Comment updated successfully", "success");
        } else {
            showAlert && showAlert("Failed to update comment", "error");
        }
    };

    const onChange = (e) => {
        setComment({ ...comment, [e.target.name]: e.target.value });
    };

    return (
        <>
            <AddComment noteId={noteId} showAlert={showAlert} />

            <div className="row my-3">
                <div className="col-12">
                    <h4>Comments ({comments.length})</h4>
                    <div className="container-fluid px-0">
                        {comments.length === 0 ? (
                            <div className="text-center text-muted my-4">
                                <p>No comments yet. Be the first to comment!</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <CommentItem 
                                    key={comment._id} 
                                    updateComment={updateComment}
                                    showAlert={showAlert} 
                                    comment={comment} 
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for editing comments */}
            <button
                ref={ref}
                type="button"
                className="btn btn-primary d-none"
                data-bs-toggle="modal"
                data-bs-target="#exampleModal"
            >
                Launch demo modal
            </button>

            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Edit Comment</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form className="my-3">
                                <div className="mb-3">
                                    <label htmlFor="text" className="form-label">Comment</label>
                                    <textarea 
                                        className="form-control" 
                                        id="text" 
                                        name="text" 
                                        value={comment.text} 
                                        onChange={onChange} 
                                        minLength={5} 
                                        required 
                                        rows="3"
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button ref={refClose} type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button disabled={comment.text.length < 5} onClick={handleClick} type="button" className="btn btn-primary">Update Comment</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Comments;