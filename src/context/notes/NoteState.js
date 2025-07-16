import NoteContext from "./noteContext";
import React, { useState } from "react";

const NoteState = (props) => {
    const host = "http://localhost:5000"; // Replace with your actual backend URL
    const [notes, setNotes] = useState([]);

    // Get all Notes
    const getNotes = async () => {
        try {
            const response = await fetch(`${host}/api/notes/fetchallnotes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token') // Replace with valid token
                }
            });
            const json = await response.json();
            setNotes(json);
        } catch (error) {
            console.error("Error fetching notes:", error);
        }
    };

    // Add a Note
    const addNote = async (title, destination, startDate, endDate, budget, travelType, description, tag) => {
        try {
            const response = await fetch(`${host}/api/notes/addnote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "auth-token": localStorage.getItem('token') // Replace with valid token
                },
                body: JSON.stringify({ title, destination, startDate, endDate, budget, travelType, description, tag })
            });
            const note = await response.json();
            setNotes(notes.concat(note));
        } catch (error) {
            console.error("Error adding note:", error);
        }
    };

    // Delete a Note
    const deleteNote = async (id) => {
        try {
            const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    "auth-token": localStorage.getItem('token') // Replace with valid token
                }
            });
            const json = await response.json();
            console.log(json);

            const newNotes = notes.filter((note) => note._id !== id);
            setNotes(newNotes);
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    };

    // Edit a Note
    const editNote = async (id, title, destination, startDate, endDate, budget, travelType, description, tag) => {
        try {
            const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "auth-token": localStorage.getItem('token') // Replace with valid token
                },
                body: JSON.stringify({ title, destination, startDate, endDate, budget, travelType, description, tag })
            });
            const json = await response.json();
            console.log(json);

            let newNotes = JSON.parse(JSON.stringify(notes)); // Deep copy of notes
            for (let index = 0; index < notes.length; index++) {
                const element = notes[index];
                if (element._id === id) {
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
            console.error("Error editing note:", error);
        }
    };

    return (
        <NoteContext.Provider value={{ notes, addNote, deleteNote, editNote, getNotes }}>
            {props.children}
        </NoteContext.Provider>
    );
};

export default NoteState;