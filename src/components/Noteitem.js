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
                    <div className='d-flex align-items-center'>
                        <h5 className="card-title">{note.title}</h5>
                        <FontAwesomeIcon
                            icon={faPenToSquare}
                            className="text-primary me-2 mx-2"
                            onClick={() => { updateNote(note); }}
                        />
                        <FontAwesomeIcon 
                            icon={faTrash} 
                            className="text-danger me-2 mx-2" 
                            onClick={() => { deleteNote(note._id); props.showAlert("Note deleted successfully", "success"); }} 
                        />
                    </div>
                    <p className="card-text">{note.description}</p>
                    <button className="btn btn-primary mt-2">Open</button>
                </div>
            </div>
        </div>
    );
};

export default Noteitem;
