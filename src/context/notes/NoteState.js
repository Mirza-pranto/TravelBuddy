import React, { useState } from "react";
import NoteContext from "./noteContext";

const NoteState = (props) => {
    const host = "http://localhost:5000";
    const notesInitial = [];
    const [notes, setNotes] = useState(notesInitial);

    // Get all notes
    const getNotes = async () => {
        try {
            const response = await fetch(`${host}/api/notes/fetchallnotes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "auth-token": localStorage.getItem('token')
                }
            });
            const json = await response.json();
            console.log("Fetched notes:", json);
            setNotes(json);
        } catch (error) {
            console.error("Error fetching notes:", error);
        }
    };

    // Get a single note by ID
    const getNoteById = async (id) => {
        try {
            const response = await fetch(`${host}/api/notes/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const json = await response.json();
                return json;
            } else {
                console.error("Failed to fetch note");
                return null;
            }
        } catch (error) {
            console.error("Error fetching note by ID:", error);
            return null;
        }
    };

    // Add a note
    const addNote = async (title, destination, startDate, endDate, budget, travelType, description, tag, images = [], featuredImage = '') => {
        try {
            const response = await fetch(`${host}/api/notes/addnote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "auth-token": localStorage.getItem('token')
                },
                body: JSON.stringify({
                    title,
                    destination,
                    startDate,
                    endDate,
                    budget,
                    travelType,
                    description,
                    tag,
                    images,
                    featuredImage
                })
            });

            if (response.ok) {
                const note = await response.json();
                console.log("Adding a new note", note);
                setNotes(notes.concat(note));
                return true;
            } else {
                console.error("Failed to add note");
                return false;
            }
        } catch (error) {
            console.error("Error adding note:", error);
            return false;
        }
    };

    // Delete a note
    const deleteNote = async (id) => {
        try {
            const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    "auth-token": localStorage.getItem('token')
                }
            });

            if (response.ok) {
                console.log("Deleting the note with id " + id);
                const newNotes = notes.filter((note) => { return note._id !== id });
                setNotes(newNotes);
                return true;
            } else {
                console.error("Failed to delete note");
                return false;
            }
        } catch (error) {
            console.error("Error deleting note:", error);
            return false;
        }
    };

    // Edit a note
    const editNote = async (id, title, description, destination, startDate, endDate, budget, travelType, tag, images = [], featuredImage = '') => {
        try {
            const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "auth-token": localStorage.getItem('token')
                },
                body: JSON.stringify({
                    title,
                    destination,
                    startDate,
                    endDate,
                    budget,
                    travelType,
                    description,
                    tag,
                    images,
                    featuredImage
                })
            });

            if (response.ok) {
                const json = await response.json();
                console.log("Editing note", json);

                let newNotes = JSON.parse(JSON.stringify(notes));
                // Logic to edit in client
                for (let index = 0; index < newNotes.length; index++) {
                    const element = newNotes[index];
                    if (element._id === id) {
                        newNotes[index] = json;
                        break;
                    }
                }
                setNotes(newNotes);
                return true;
            } else {
                console.error("Failed to edit note");
                return false;
            }
        } catch (error) {
            console.error("Error editing note:", error);
            return false;
        }
    };

    return (
        <NoteContext.Provider value={{
            notes,
            addNote,
            deleteNote,
            editNote,
            getNotes,
            getNoteById
        }}>
            {props.children}
        </NoteContext.Provider>
    );
};

export default NoteState;