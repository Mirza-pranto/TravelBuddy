// src/context/notes/NoteState.js - Updated version
import React, { useState } from 'react';
import noteContext from './noteContext';

const NoteState = (props) => {
    const host = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const notesInitial = [];
    const [notes, setNotes] = useState(notesInitial);

    // Get all Notes
    const getNotes = async () => {
        // API Call
        const response = await fetch(`${host}/api/notes/fetchallnotes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            }
        });
        const json = await response.json();
        setNotes(json);
    };

    // Get a single note by ID
    const getNoteById = async (id) => {
        try {
            const response = await fetch(`${host}/api/notes/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const json = await response.json();
            
            if (response.ok) {
                return json;
            } else {
                console.error('Error fetching note:', json.error);
                return null;
            }
        } catch (error) {
            console.error('Error fetching note:', error);
            return null;
        }
    };

    // Add a Note
    const addNote = async (title, destination, startDate, endDate, budget, travelType, description, tag, images = [], featuredImage = '') => {
        // API Call
        const response = await fetch(`${host}/api/notes/addnote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
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
        
        const json = await response.json();
        
        if (json.errors) {
            console.error('Validation errors:', json.errors);
            return false;
        }
        
        if (response.ok) {
            setNotes(notes.concat(json));
            return true;
        } else {
            console.error('Error adding note:', json);
            return false;
        }
    };

    // Delete a Note
    const deleteNote = async (id) => {
        // API Call
        const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            }
        });
        const json = await response.json();
        console.log(json);

        const newNotes = notes.filter((note) => { return note._id !== id });
        setNotes(newNotes);
    };

    // Edit a Note
    const editNote = async (id, title, description, destination, startDate, endDate, budget, travelType, tag) => {
        // API Call
        const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ title, description, destination, startDate, endDate, budget, travelType, tag })
        });
        const json = await response.json();

        let newNotes = JSON.parse(JSON.stringify(notes));
        // Logic to edit in client
        for (let index = 0; index < newNotes.length; index++) {
            const element = newNotes[index];
            if (element._id === id) {
                newNotes[index].title = title;
                newNotes[index].description = description;
                newNotes[index].destination = destination;
                newNotes[index].startDate = startDate;
                newNotes[index].endDate = endDate;
                newNotes[index].budget = budget;
                newNotes[index].travelType = travelType;
                newNotes[index].tag = tag;
                break;
            }
        }
        setNotes(newNotes);
    };

    return (
        <noteContext.Provider value={{ notes, addNote, deleteNote, editNote, getNotes, getNoteById }}>
            {props.children}
        </noteContext.Provider>
    );
};

export default NoteState;