import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import noteContext from '../context/notes/noteContext';

const Noteitem = (props) => {
    const context = React.useContext(noteContext);
    const { note, updateNote } = props;
    const { deleteNote } = context;

    return (
        <div className="col-md-3">
            <div className="card my-3" style={{ width: '18rem' }}>
                <div className="card-body">
                    <div className='d-flex align-items-center justify-content-between'>
                        <h5 className="card-title">{note.title}</h5>
                        <div>
                            <FontAwesomeIcon
                                icon={faPenToSquare}
                                className="text-success me-2 mx-2"
                                onClick={() => { updateNote(note); }}
                            />
                            <FontAwesomeIcon
                                icon={faTrash}
                                className="text-danger me-2 mx-2"
                                onClick={() => { deleteNote(note._id); props.showAlert("Note deleted successfully", "success"); }}
                            />
                        </div>
                    </div>
                    <p className="card-text">Destination: {note.destination}</p>
                    <p className="card-text">Travel Type: {note.travelType}</p>
                    <p className="card-text">Budget: ${note.budget}</p>
                    <p className="card-text">Start Date: {new Date(note.startDate).toLocaleDateString()}</p>
                    <p className="card-text">End Date: {new Date(note.endDate).toLocaleDateString()}</p>
                    <p className="card-text">{note.description}</p>
                    <button className="btn btn-success mt-2">Open</button>
                </div>
            </div>
        </div>
    );
};

export default Noteitem;