import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, 
  faPenToSquare, 
  faStar, 
  faMapMarkerAlt, 
  faCalendar, 
  faDollarSign,
  faImage
} from '@fortawesome/free-solid-svg-icons';
import noteContext from '../context/notes/noteContext';
import JoinRequestButton from './JoinRequestButton';

const Noteitem = (props) => {
    const context = React.useContext(noteContext);
    const { deleteNote } = context;
    const { note, updateNote, showAlert, editable = true } = props;
    const navigate = useNavigate(); // Add navigation hook

    // Handle profile click navigation
    const handleProfileClick = (e) => {
        e.preventDefault(); // Prevent the Link navigation
        e.stopPropagation();
        if (note.user && note.user._id) {
            navigate(`/profile/${note.user._id}`);
        }
    };

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

    const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    
    // Remove any leading slash that might cause double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `http://localhost:5000/${cleanPath}`;
};

    const getProfilePicUrl = (profilePic) => {
        if (!profilePic) return "https://via.placeholder.com/40?text=User";
        if (profilePic.startsWith('http')) return profilePic;
        return `http://localhost:5000${profilePic}`; // Match your existing host configuration
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-warning" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-warning" style={{ opacity: 0.5 }} />);
            } else {
                stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-muted" />);
            }
        }
        return stars;
    };

    // Get the display image (featured image or first image from array)
    const displayImage = note.featuredImage || 
                       (note.images && note.images.length > 0 ? note.images[0] : null);

    return (
        <div className="col-md-4 my-3">
            <div className="card h-100 shadow-sm hover-shadow">
                {/* Image Section */}
                <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                    {displayImage ? (
                        <img 
                            src={getImageUrl(displayImage)} 
                            alt={note.title}
                            className="card-img-top h-100"
                            style={{ 
                                objectFit: 'cover',
                                width: '100%'
                            }}
                            onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Found";
                                e.target.className = "card-img-top h-100 bg-light";
                            }}
                        />
                    ) : (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-light text-muted">
                            <FontAwesomeIcon icon={faImage} size="3x" />
                            <span>No Image</span>
                        </div>
                    )}
                    
                    {/* Travel Type Badge */}
                    <span className={`badge position-absolute top-0 end-0 m-2 ${
                        note.travelType === 'Adventure' ? 'bg-danger' :
                        note.travelType === 'Relax' ? 'bg-info' :
                        note.travelType === 'Cultural' ? 'bg-primary' :
                        note.travelType === 'Backpacking' ? 'bg-warning' : 'bg-secondary'
                    }`}>
                        {note.travelType}
                    </span>
                    
                    {/* Additional Images Count */}
                    {note.images && note.images.length > 1 && (
                        <span className="badge bg-dark position-absolute bottom-0 end-0 m-2">
                            +{note.images.length - 1} more
                        </span>
                    )}
                </div>

                <div className="card-body d-flex flex-column">
                    {/* Author Info */}
                    {note.user && (
                        <div className="d-flex align-items-center mb-3">
                            <img 
                                src={getProfilePicUrl(note.user.profilePic)} 
                                alt={note.user.name}
                                className="rounded-circle me-2"
                                style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    objectFit: 'cover', 
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s ease'
                                }}
                                onClick={handleProfileClick}
                                title="Click to view profile"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/40?text=User";
                                }}
                                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                            />
                            <div className="flex-grow-1">
                                <h6 
                                    className="mb-0 fw-bold text-primary" 
                                    style={{ 
                                        cursor: 'pointer',
                                        transition: 'color 0.2s ease'
                                    }}
                                    onClick={handleProfileClick}
                                    title="Click to view profile"
                                    onMouseOver={(e) => e.target.style.color = '#0056b3'}
                                    onMouseOut={(e) => e.target.style.color = '#0d6efd'}
                                >
                                    {note.user.name}
                                </h6>
                                {note.user.averageRating > 0 && (
                                    <div className="d-flex align-items-center">
                                        <div className="me-1">
                                            {renderStars(note.user.averageRating)}
                                        </div>
                                        <small className="text-muted">
                                            ({note.user.totalRatings} reviews)
                                        </small>
                                    </div>
                                )}
                            </div>
                            {editable && (
                                <div>
                                    <FontAwesomeIcon
                                        icon={faPenToSquare}
                                        className="text-success me-2 cursor-pointer"
                                        onClick={(e) => handleActionClick(e, 'edit')}
                                        title="Edit note"
                                        style={{ 
                                            transition: 'color 0.2s ease'
                                        }}
                                        onMouseOver={(e) => e.target.style.color = '#198754'}
                                        onMouseOut={(e) => e.target.style.color = '#28a745'}
                                    />
                                    <FontAwesomeIcon
                                        icon={faTrash}
                                        className="text-danger cursor-pointer"
                                        onClick={(e) => handleActionClick(e, 'delete')}
                                        title="Delete note"
                                        style={{ 
                                            transition: 'color 0.2s ease'
                                        }}
                                        onMouseOver={(e) => e.target.style.color = '#dc3545'}
                                        onMouseOut={(e) => e.target.style.color = '#e74c3c'}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Note Content */}
                    <Link to={`/post/${note._id}`} className="text-decoration-none text-dark">
                        <h5 className="card-title mb-3">{note.title}</h5>
                        
                        <div className="mb-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary me-2" />
                            <strong>{note.destination}</strong>
                        </div>

                        <div className="mb-2">
                            <FontAwesomeIcon icon={faDollarSign} className="text-success me-2" />
                            <span className="fw-bold">${note.budget}</span>
                        </div>

                        <div className="mb-2">
                            <FontAwesomeIcon icon={faCalendar} className="text-info me-2" />
                            <small className="text-muted">
                                {new Date(note.startDate).toLocaleDateString()} - {new Date(note.endDate).toLocaleDateString()}
                            </small>
                        </div>

                        <p className="card-text text-muted" style={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {note.description}
                        </p>

                        {note.tag && (
                            <span className="badge bg-light text-dark border me-2">
                                {note.tag}
                            </span>
                        )}

                        {/* Posted Date */}
                        {note.createdAt && (
                            <div className="mt-auto pt-2">
                                <small className="text-muted">
                                    Posted on {new Date(note.createdAt).toLocaleDateString()}
                                </small>
                            </div>
                        )}
                    </Link>

                    {/* Join Request Button - Only show for non-editable cards (public view) */}
                    {!editable && (
                        <div className="mt-3">
                            <JoinRequestButton 
                                tourId={note._id} 
                                showAlert={showAlert}
                                className="btn-sm w-100"
                            />
                        </div>
                    )}
                </div>

                {/* Image Gallery Preview */}
                {note.images && note.images.length > 1 && (
                    <div className="card-footer bg-light p-2">
                        <div className="d-flex overflow-auto" style={{ gap: '5px' }}>
                            {note.images.slice(0, 4).map((image, index) => (
                                <img 
                                    key={index}
                                    src={getImageUrl(image)} 
                                    alt={`Tour ${index + 1}`}
                                    className="rounded"
                                    style={{ 
                                        width: '50px', 
                                        height: '50px', 
                                        objectFit: 'cover',
                                        flexShrink: 0
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/50x50?text=Image";
                                    }}
                                />
                            ))}
                            {note.images.length > 4 && (
                                <div 
                                    className="d-flex align-items-center justify-content-center bg-secondary text-white rounded"
                                    style={{ 
                                        width: '50px', 
                                        height: '50px',
                                        fontSize: '12px',
                                        flexShrink: 0
                                    }}
                                >
                                    +{note.images.length - 4}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Noteitem;