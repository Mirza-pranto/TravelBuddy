import commentContext from "./commentContext";
import React, { useState } from "react";

const CommentState = (props) => {
    const host = "http://localhost:5000";
    const [comments, setComments] = useState([]);

    // Get all Comments for a specific note
    const getComments = async (noteId) => {
        try {
            const response = await fetch(`${host}/api/comments/fetchallcomment/${noteId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                }
            });
            const json = await response.json();
            setComments(json);
            return json;
        } catch (error) {
            console.error("Error fetching comments:", error);
            return [];
        }
    };

    // Add a Comment to a specific note
    const addComment = async (noteId, text) => {
        try {
            const response = await fetch(`${host}/api/comments/addcomment/${noteId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "auth-token": localStorage.getItem('token')
                },
                body: JSON.stringify({ text })
            });
            
            if (response.ok) {
                const comment = await response.json();
                setComments(comments.concat(comment));
                return comment;
            } else {
                const errorData = await response.json();
                console.error("Error adding comment:", errorData);
                return null;
            }
        } catch (error) {
            console.error("Error adding comment:", error);
            return null;
        }
    };

    // Delete a Comment
    const deleteComment = async (id) => {
        try {
            const response = await fetch(`${host}/api/comments/deletecomment/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    "auth-token": localStorage.getItem('token')
                }
            });

            if (response.ok) {
                const newComments = comments.filter((comment) => comment._id !== id);
                setComments(newComments);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error deleting comment:", error);
            return false;
        }
    };

    // Edit a Comment
    const editComment = async (id, text) => {
        try {
            const response = await fetch(`${host}/api/comments/updatecomment/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "auth-token": localStorage.getItem('token')
                },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                let newComments = JSON.parse(JSON.stringify(comments));
                for (let index = 0; index < newComments.length; index++) {
                    if (newComments[index]._id === id) {
                        newComments[index].text = text;
                        break;
                    }
                }
                setComments(newComments);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error editing comment:", error);
            return false;
        }
    };

    return (
        <commentContext.Provider value={{
            comments,
            addComment,
            deleteComment,
            editComment,
            getComments
        }}>
            {props.children}
        </commentContext.Provider>
    );
};

export default CommentState;