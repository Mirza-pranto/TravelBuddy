import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import noteContext from '../context/notes/noteContext';

const Noteitem = (props) => {
    const context = React.useContext(noteContext);
    const { deleteNote } = context;
    const { note, updateNote, showAlert, editable = true } = props;

    const handleActionClick = (e, action) => {
        e.preventDefault();
        e.stopPropagation();
        if (action === 'edit') {
            updateNote(note);
        } else if (action === 'delete') {
            deleteNote(note._id);
            if (showAlert) showAlert("Note deleted successfully", "success");
        }
    };

    return (
        <div className="col-md-4 my-3 ">
            <Link to={`/post/${note._id}`} className="text-decoration-none " style={{ color: 'inherit' }}>
                <div className="card my-3 shadow-sm" style={{ minHeight: '100%' }}>
                    <div className="card-body d-flex flex-column bg-light">
                        <div className='d-flex align-items-start justify-content-between'>
                            <h5 className="card-title">{note.title}</h5>
                            {editable && (
                                <div>
                                    <FontAwesomeIcon
                                        icon={faPenToSquare}
                                        className="text-success me-2 mx-2 cursor-pointer"
                                        onClick={(e) => handleActionClick(e, 'edit')}
                                    />
                                    <FontAwesomeIcon
                                        icon={faTrash}
                                        className="text-danger me-2 mx-2 cursor-pointer"
                                        onClick={(e) => handleActionClick(e, 'delete')}
                                    />
                                </div>
                            )}
                        </div>
                        <p className="card-text"><strong>Destination:</strong> {note.destination}</p>
                        <p className="card-text"><strong>Travel Type:</strong> {note.travelType}</p>
                        <p className="card-text"><strong>Budget:</strong> ${note.budget}</p>
                        <p className="card-text"><strong>Travel Date:</strong> {new Date(note.startDate).toLocaleDateString()} <b>to</b> {new Date(note.endDate).toLocaleDateString()}</p>

                        <p className="card-text">{note.description}</p>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default Noteitem;