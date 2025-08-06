import React, { useContext, useState } from 'react';
import noteContext from '../context/comments/noteContext';

const AddComment = (props) => {
    const context = useContext(noteContext);
    const { addComment } = context;

    const [comment, setComment] = useState({
        text: "",
    });

    const handleClick = (e) => {
        e.preventDefault();
        addComment(comment.text);
        setComment({
            text: "",
            
        }); // Reset the form after adding
        props.showAlert("comment added successfully", "success");
    };

    const onChange = (e) => {
        setNote({ ...comment, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <div className='container my-3'>
                <h1>Create a Tour Post...</h1>
                <form className='my-3'>
                    <div className="mb-3">
                        <label htmlFor="title" className="form-label">Comment </label>
                        <input type="text" className="form-control" id="title" name="title" value={comment.title} onChange={onChange} minLength={5} required />
                    </div>

                    <button disabled={comment.title.length < 5 || comment.description.length < 5} type="submit" className="btn btn-success" onClick={handleClick}>Comment</button>
                </form>
            </div>
        </div>
    );
};

export default AddComment;
