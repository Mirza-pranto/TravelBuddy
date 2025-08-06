import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import commentContext from "../context/comments/commentContext";
import CommentItem from './CommentItem';
import AddNote from './AddNote';

const Comments = (props) => {
    const context = useContext(commentContext);
    const { comments = [], getComments, editComment } = context; // Provide default empty array
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            getComments();
        } else {
            navigate('/login');
        }
        // eslint-disable-next-line
    }, []);

    const ref = useRef(null);
    const refClose = useRef(null);
    const [comment, setComment] = useState({
        
        text: ""
    });

    const updateComment = (currentComment) => {
        ref.current.click();
        setComment({
            id: currentComment._id,
            text: currentComment.text,

        });
    };

    const handleClick = (e) => {
        editComment(comment.id, comment.text);
        refClose.current.click();
    };

    const onChange = (e) => {
        setComment({ ...comment, [e.target.name]: e.target.value });
    };

    const handleClick = (e) => {
        editComment(comment.id, comment.text);
        refClose.current.click();
    };

    const onChange = (e) => {
        setComment({ ...comment, [e.target.name]: e.target.value });
    };

    return (
        <>
            <AddComment showAlert={props.showAlert} />

            <div className="row my-3">
                <h2>Your Tour Posts...</h2>
                <div className="container mx-2">
                    {Array.isArray(Comments) && Comments.length === 0 && 'No Comments to display'}
                </div>
                {Array.isArray(Comments) ? (
                    Comments.map((comment) => (
                        <Noteitem 
                            key={comment._id} 
                            updateComment={updateComment}
                            showAlert={props.showAlert} 
                            comment={comment} 
                        />
                    ))
                ) : (
                    <div className="container">Loading...</div>
                )}
            </div>
        </>
    );
};

export default Comments;