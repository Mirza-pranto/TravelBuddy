import React, { useContext, useState } from 'react';
import noteContext from '../context/notes/noteContext';

const AddNote = (props) => {
    const context = useContext(noteContext);
    const { addNote } = context;

    const [note, setNote] = useState({
        title: "",
        destination: "",
        startDate: "",
        endDate: "",
        budget: "",
        travelType: "",
        description: "",
        tag: ""
    });

    const handleClick = (e) => {
        e.preventDefault();
        addNote(note.title, note.destination, note.startDate, note.endDate, note.budget, note.travelType, note.description, note.tag);
        setNote({
            title: "",
            destination: "",
            startDate: "",
            endDate: "",
            budget: "",
            travelType: "",
            description: "",
            tag: ""
        }); // Reset the form after adding
        props.showAlert("Note added successfully", "success");
    };

    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <div className='container my-3'>
                <h1>Create a Tour Post...</h1>
                <form className='my-3'>
                    <div className="mb-3">
                        <label htmlFor="title" className="form-label">Title</label>
                        <input type="text" className="form-control" id="title" name="title" value={note.title} onChange={onChange} minLength={5} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="destination" className="form-label">Destination</label>
                        <input type="text" className="form-control" id="destination" name="destination" value={note.destination} onChange={onChange} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="startDate" className="form-label">Start Date</label>
                        <input type="date" className="form-control" id="startDate" name="startDate" value={note.startDate} onChange={onChange} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="endDate" className="form-label">End Date</label>
                        <input type="date" className="form-control" id="endDate" name="endDate" value={note.endDate} onChange={onChange} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="budget" className="form-label">Budget</label>
                        <input type="number" className="form-control" id="budget" name="budget" value={note.budget} onChange={onChange} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="travelType" className="form-label">Travel Type</label>
                        <select className="form-control" id="travelType" name="travelType" value={note.travelType} onChange={onChange} required>
                            <option value="Adventure">Adventure</option>
                            <option value="Relax">Relax</option>
                            <option value="Cultural">Cultural</option>
                            <option value="Backpacking">Backpacking</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="description" className="form-label">Description</label>
                        <textarea className="form-control" id="description" name="description" value={note.description} onChange={onChange} minLength={5} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="tag" className="form-label">Tag</label>
                        <input type="text" className="form-control" id="tag" name="tag" value={note.tag} onChange={onChange} />
                    </div>
                    <button disabled={note.title.length < 5 || note.description.length < 5} type="submit" className="btn btn-success" onClick={handleClick}>Add Note</button>
                </form>
            </div>
        </div>
    );
};

export default AddNote;