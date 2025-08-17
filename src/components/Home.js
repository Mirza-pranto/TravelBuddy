import React, { useEffect, useState } from 'react';
import Noteitem from './Noteitem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const Home = (props) => {
    const [allNotes, setAllNotes] = useState([]);
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [search, setSearch] = useState({
        destination: "",
        date: ""
    });
    const [loading, setLoading] = useState(true);

    // Fetch all notes (tours) from backend with populated user data
    useEffect(() => {
        const fetchAllNotes = async () => {
            try {
                setLoading(true);
                const response = await fetch("http://localhost:5000/api/notes/newsfeed?populate=user");
                const json = await response.json();
                
                // Transform the data to ensure user information is properly structured
                const transformedNotes = json.map(note => ({
                    ...note,
                    user: note.user || { name: 'Unknown User' } // Fallback if user data is missing
                }));
                
                setAllNotes(transformedNotes);
                setFilteredNotes(transformedNotes);
            } catch (error) {
                console.error("Failed to fetch newsfeed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllNotes();
    }, []);

    // Handle input changes for search filters
    const handleSearchChange = (e) => {
        setSearch({ ...search, [e.target.name]: e.target.value });
    };

    // Filter notes based on destination and date
    const filterNotes = () => {
        let result = allNotes;

        if (search.destination.trim()) {
            result = result.filter(note =>
                note.destination &&
                note.destination.toLowerCase().includes(search.destination.toLowerCase())
            );
        }

        if (search.date) {
            result = result.filter(note =>
                note.startDate &&
                new Date(note.startDate).toISOString().split("T")[0] === search.date
            );
        }

        setFilteredNotes(result);
    };

    useEffect(() => {
        filterNotes();
        // eslint-disable-next-line
    }, [search]);

    if (loading) {
        return (
            <div className="container my-3 text-center">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-primary" />
                <p className="mt-2">Loading tours...</p>
            </div>
        );
    }

    return (
        <div className="container my-3">
            <h2 className="mb-4">🌍 TravelBuddy Newsfeed</h2>

            <div className="row mb-4">
                <div className="col-md-6 mb-2">
                    <input
                        type="text"
                        className="form-control"
                        name="destination"
                        placeholder="Search by destination"
                        value={search.destination}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="col-md-6 mb-2">
                    <input
                        type="date"
                        className="form-control"
                        name="date"
                        value={search.date}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <div className="row">
                {filteredNotes.length === 0 ? (
                    <div className="col-12 text-center py-5">
                        <h4>No tours found</h4>
                        <p className="text-muted">Try adjusting your search filters</p>
                    </div>
                ) : (
                    filteredNotes.map(note => (
                        <Noteitem 
                            key={note._id} 
                            note={note} 
                            editable={false} 
                            showAlert={props.showAlert}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default Home;