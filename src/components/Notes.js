import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import noteContext from "../context/notes/noteContext";
import Noteitem from './Noteitem';
import AddNote from './AddNote';

const Notes = (props) => {
    const context = useContext(noteContext);
    const { notes = [], getNotes, editNote } = context; // Provide default empty array
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            getNotes();
        } else {
            navigate('/login');
        }
        // eslint-disable-next-line
    }, []);

    const ref = useRef(null);
    const refClose = useRef(null);
    const [note, setNote] = useState({
        id: "",
        etitle: "",
        edescription: "",
        edestination: "",
        estartDate: "",
        eendDate: "",
        ebudget: "",
        etag: "",
        etravelType: ""
    });

    const updateNote = (currentNote) => {
        ref.current.click();
        setNote({
            id: currentNote._id,
            etitle: currentNote.title,
            edescription: currentNote.description,
            edestination: currentNote.destination,
            estartDate: currentNote.startDate,
            eendDate: currentNote.endDate,
            ebudget: currentNote.budget,
            etag: currentNote.tag,
            etravelType: currentNote.travelType
        });
    };

    const handleClick = (e) => {
        editNote(note.id, note.etitle, note.edescription, note.edestination, note.estartDate, note.eendDate, note.ebudget, note.etravelType, note.etag);
        refClose.current.click();
    };

    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value });
    };

    return (
        <>
            <AddNote showAlert={props.showAlert} />
            <button ref={ref} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#exampleModal">
                Launch demo modal
            </button>
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Edit Note</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form className="my-3">
                                <div className="mb-3">
                                    <label htmlFor="etitle" className="form-label">Title</label>
                                    <input type="text" className="form-control" id="etitle" name="etitle" value={note.etitle} onChange={onChange} minLength={5} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="edestination" className="form-label">Destination</label>
                                    <input type="text" className="form-control" id="edestination" name="edestination" value={note.edestination} onChange={onChange} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="estartDate" className="form-label">Start Date</label>
                                    <input type="date" className="form-control" id="estartDate" name="estartDate" value={note.estartDate} onChange={onChange} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="eendDate" className="form-label">End Date</label>
                                    <input type="date" className="form-control" id="eendDate" name="eendDate" value={note.eendDate} onChange={onChange} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="ebudget" className="form-label">Budget</label>
                                    <input type="number" className="form-control" id="ebudget" name="ebudget" value={note.ebudget} onChange={onChange} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="etravelType" className="form-label">Travel Type</label>
                                    <select className="form-control" id="etravelType" name="etravelType" value={note.etravelType} onChange={onChange} required>
                                        <option value="Adventure">Adventure</option>
                                        <option value="Relax">Relax</option>
                                        <option value="Cultural">Cultural</option>
                                        <option value="Backpacking">Backpacking</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="etag" className="form-label">Tag</label>
                                    <input type="text" className="form-control" id="etag" name="etag" value={note.etag} onChange={onChange} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="edescription" className="form-label">Description</label>
                                    <textarea className="form-control" id="edescription" name="edescription" value={note.edescription} onChange={onChange} minLength={5} required />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button ref={refClose} type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button disabled={note.etitle.length < 5 || note.edescription.length < 5} onClick={handleClick} type="button" className="btn btn-primary">Update Note</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row my-3">
                <h2>Your Tour Posts...</h2>
                <div className="container mx-2">
                    {Array.isArray(notes) && notes.length === 0 && 'No notes to display'}
                </div>
                {Array.isArray(notes) ? (
                    notes.map((note) => (
                        <Noteitem 
                            key={note._id} 
                            updateNote={updateNote}
                            showAlert={props.showAlert} 
                            note={note} 
                        />
                    ))
                ) : (
                    <div className="container">Loading...</div>
                )}
            </div>
        </>
    );
};

export default Notes;