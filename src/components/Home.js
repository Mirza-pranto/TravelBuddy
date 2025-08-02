import React, { useEffect, useState } from 'react';
import Noteitem from './Noteitem';

const Home = (props) => {
    const [allNotes, setAllNotes] = useState([]);
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [search, setSearch] = useState({
        destination: "",
        date: ""
    });

    // Fetch all notes (tours) from backend
    useEffect(() => {
        const fetchAllNotes = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/notes/newsfeed");
                const json = await response.json();
                console.log("Fetched Notes:", json); // Optional: for debugging
                setAllNotes(json);
                setFilteredNotes(json);
            } catch (error) {
                console.error("Failed to fetch newsfeed:", error);
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
                    <p>No tours found.</p>
                ) : (
                    filteredNotes.map(note => (
                        <Noteitem key={note._id} note={note} editable={false} />
                    ))
                )}
            </div>
        </div>
    );
};

export default Home;
