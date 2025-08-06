import React, { useContext, useState } from 'react';
import commentContext from '../context/comments/commentContext';

const AddComment = ({ noteId, showAlert }) => {
    const context = useContext(commentContext);
    const { addComment } = context;

    const [comment, setComment] = useState({
        text: "",
    });

    const handleClick = async (e) => {
        e.preventDefault();
        if (comment.text.length < 5) {
            showAlert && showAlert("Comment must be at least 5 characters long", "error");
            return;
        }

        const result = await addComment(noteId, comment.text);
        if (result) {
            setComment({ text: "" }); // Reset the form after adding
            showAlert && showAlert("Comment added successfully", "success");
        } else {
            showAlert && showAlert("Failed to add comment", "error");
        }
    };

    const onChange = (e) => {
        setComment({ ...comment, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <div className='container my-3'>
                <h3>Add a Comment</h3>
                <form className='my-3'>
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
                            placeholder="Write your comment here..."
                        />
                    </div>
                    <button 
                        disabled={comment.text.length < 5} 
                        type="submit" 
                        className="btn btn-primary" 
                        onClick={handleClick}
                    >
                        Add Comment
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddComment;