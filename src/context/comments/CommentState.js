import CommnetContext from "./commentContext";
import React, { useState } from "react";

const CommentState = (props) => {
    const host = "http://localhost:5000"; // Replace with your actual backend URL
    const [comments, setComments] = useState([]);

    // Get all Comments
    const getComments = async () => {
        try {
            const response = await fetch(`${host}/api/comments/fetchallcomments`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                }
            });
            const json = await response.json();
            setNotes(json);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    // ✅ Get a single Comment by Note ID
    const getCommentById = async (id) => {
        try {
            const response = await fetch(`${host}/api/comments/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                }
            });
            const comment = await response.json();
            return comment;
        } catch (error) {
            console.error("Error fetching comment by ID:", error);
            return null;
        }
    };

    // Add a Comment
    const addComment = async (text) => {
        try {
            const response = await fetch(`${host}/api/comments/addcomment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "auth-token": localStorage.getItem('token')
                },
                body: JSON.stringify({ text })
            });
            const comment = await response.json();
            setComments(comments.concat(comment));
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    // Delete a Comment
    const deleteNote = async (id) => {
        try {
            await fetch(`${host}/api/comments/deletenote/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    "auth-token": localStorage.getItem('token')
                }
            });

            const newNotes = comments.filter((comment) => comment._id !== id);
            setNotes(newNotes);
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    // Edit a Comment
    const editNote = async (id, title, destination, startDate, endDate, budget, travelType, description, tag) => {
        try {
            await fetch(`${host}/api/comments/updatenote/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "auth-token": localStorage.getItem('token')
                },
                body: JSON.stringify({ title, destination, startDate, endDate, budget, travelType, description, tag })
            });

            let newNotes = JSON.parse(JSON.stringify(comments)); // Deep copy of comments
            for (let index = 0; index < comments.length; index++) {
                if (newNotes[index]._id === id) {
                    newNotes[index].title = title;
                    newNotes[index].destination = destination;
                    newNotes[index].startDate = startDate;
                    newNotes[index].endDate = endDate;
                    newNotes[index].budget = budget;
                    newNotes[index].travelType = travelType;
                    newNotes[index].description = description;
                    newNotes[index].tag = tag;
                    break;
                }
            }
            setNotes(newNotes);
        } catch (error) {
            console.error("Error editing comment:", error);
        }
    };

    return (
        <NoteContext.Provider value={{
            comments,
            addNote,
            deleteNote,
            editNote,
            getNotes,
            getNoteById // ✅ include this in the context value
        }}>
            {props.children}
        </NoteContext.Provider>
    );
};

export default NoteState;
