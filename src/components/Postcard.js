import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faMapMarkerAlt, 
  faCalendar, 
  faDollarSign, 
  faUsers, 
  faTag,
  faImage,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import noteContext from '../context/notes/noteContext';
import Comments from './Comments';

const Postcard = ({ showAlert }) => {
    const { id } = useParams();
    const context = useContext(noteContext);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Helper function to calculate trip duration in days
    const calculateTripDuration = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const response = await context.getNoteById(id);
                if (response) {
                    setPost(response);
                    // Set the first available image as selected
                    const firstImage = response.featuredImage || 
                                     (response.images && response.images.length > 0 ? response.images[0] : null);
                    setSelectedImage(firstImage);
                } else {
                    showAlert && showAlert("Post not found", "error");
                }
            } catch (err) {
                console.error('Error fetching post:', err);
                showAlert && showAlert("Error loading post", "error");
            } finally {
                setLoading(false);
            }
        };

        if (id && context.getNoteById) {
            fetchPost();
        }
    }, [id, context, showAlert]);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imagePath}`;
    };

    const getProfilePicUrl = (profilePic) => {
        if (!profilePic) return "https://via.placeholder.com/150?text=User";
        if (profilePic.startsWith('http')) return profilePic;
        return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${profilePic}`;
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

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h3 className="mt-3">Loading post details...</h3>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="container mt-5 text-center">
                <h3>Post not found</h3>
                <p>The post you're looking for doesn't exist or has been removed.</p>
            </div>
        );
    }

    // Get all unique images (combine featuredImage and images array)
    const allImages = [
        ...(post.featuredImage ? [post.featuredImage] : []),
        ...(post.images || [])
    ].filter((img, index, self) => 
        img && self.findIndex(t => t === img) === index
    );

    return (
        <div className="container mt-4">
            {/* Author Info Section */}
            {post.user && (
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="d-flex align-items-center">
                            <img 
                                src={getProfilePicUrl(post.user.profilePic)} 
                                alt={post.user.name}
                                className="rounded-circle me-3"
                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/60?text=User";
                                }}
                            />
                            <div className="flex-grow-1">
                                <h5 className="mb-1 fw-bold">{post.user.name}</h5>
                                <div className="d-flex align-items-center mb-1">
                                    {post.user.averageRating > 0 ? (
                                        <>
                                            <div className="me-2">
                                                {renderStars(post.user.averageRating)}
                                            </div>
                                            <span className="text-muted">
                                                {post.user.averageRating.toFixed(1)} ({post.user.totalRatings} reviews)
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-muted">New traveler</span>
                                    )}
                                </div>
                                {post.user.bio && (
                                    <p className="text-muted mb-0 small">{post.user.bio}</p>
                                )}
                            </div>
                            <div className="text-end">
                                <small className="text-muted">
                                    Posted on {new Date(post.createdAt).toLocaleDateString()}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Post Content */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row">
                        {/* Image Section */}
                        {allImages.length > 0 ? (
                            <div className="col-lg-6 mb-4">
                                {/* Main Image Display */}
                                <div className="mb-3">
                                    <div 
                                        className="position-relative"
                                        style={{ height: '300px', overflow: 'hidden' }}
                                    >
                                        <img 
                                            src={getImageUrl(selectedImage || allImages[0])} 
                                            alt={post.title}
                                            className="img-fluid rounded shadow w-100 h-100"
                                            style={{ 
                                                objectFit: 'cover',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setShowModal(true)}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://via.placeholder.com/600x400?text=Image+Not+Found";
                                            }}
                                        />
                                        <div 
                                            className="position-absolute top-0 end-0 m-2 bg-white rounded-circle p-1 cursor-pointer"
                                            onClick={() => setShowModal(true)}
                                        >
                                            <FontAwesomeIcon icon={faImage} className="text-primary" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Thumbnail Gallery */}
                                {allImages.length > 1 && (
                                    <div className="d-flex overflow-auto" style={{ gap: '8px' }}>
                                        {allImages.map((image, index) => (
                                            <div key={index} className="position-relative">
                                                <img 
                                                    src={getImageUrl(image)} 
                                                    alt={`Tour ${index + 1}`}
                                                    className={`rounded cursor-pointer ${selectedImage === image ? 'border border-primary border-3' : ''}`}
                                                    style={{ 
                                                        width: '80px', 
                                                        height: '80px', 
                                                        objectFit: 'cover',
                                                        flexShrink: 0
                                                    }}
                                                    onClick={() => setSelectedImage(image)}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://via.placeholder.com/80x80?text=Image";
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="col-lg-6 mb-4 d-flex align-items-center justify-content-center bg-light rounded">
                                <div className="text-center text-muted p-5">
                                    <FontAwesomeIcon icon={faImage} size="3x" className="mb-3" />
                                    <h5>No Images Available</h5>
                                </div>
                            </div>
                        )}

                        {/* Post Details */}
                        <div className={allImages.length > 0 ? "col-lg-6" : "col-12"}>
                            <h1 className="mb-4">{post.title}</h1>
                            
                            <div className="row mb-3">
                                <div className="col-md-6 mb-2">
                                    <div className="d-flex align-items-center">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary me-2" />
                                        <div>
                                            <strong>Destination</strong>
                                            <div className="text-muted">{post.destination}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <div className="d-flex align-items-center">
                                        <FontAwesomeIcon icon={faUsers} className="text-info me-2" />
                                        <div>
                                            <strong>Travel Type</strong>
                                            <div className="text-muted">{post.travelType}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <div className="d-flex align-items-center">
                                        <FontAwesomeIcon icon={faDollarSign} className="text-success me-2" />
                                        <div>
                                            <strong>Budget</strong>
                                            <div className="text-muted fw-bold">${post.budget}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <div className="d-flex align-items-center">
                                        <FontAwesomeIcon icon={faCalendar} className="text-warning me-2" />
                                        <div>
                                            <strong>Duration</strong>
                                            <div className="text-muted">
                                                {calculateTripDuration(post.startDate, post.endDate)} days
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {post.tag && (
                                <div className="mb-3">
                                    <FontAwesomeIcon icon={faTag} className="text-secondary me-2" />
                                    <span className="badge bg-light text-dark border">{post.tag}</span>
                                </div>
                            )}

                            <div className="mb-3">
                                <h5>Description</h5>
                                <p className="text-muted" style={{ lineHeight: '1.6' }}>
                                    {post.description}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex gap-2">
                                <button className="btn btn-success btn-lg">
                                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                                    Request to Join
                                </button>
                                <button className="btn btn-outline-primary">
                                    <FontAwesomeIcon icon={faStar} className="me-2" />
                                    Add to Wishlist
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trip Details Card */}
            <div className="card mb-4">
                <div className="card-header bg-light">
                    <h5 className="mb-0">Trip Details</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-3 mb-3">
                            <strong>Start Date</strong>
                            <div className="text-muted">
                                {new Date(post.startDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                        <div className="col-md-3 mb-3">
                            <strong>End Date</strong>
                            <div className="text-muted">
                                {new Date(post.endDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                        <div className="col-md-3 mb-3">
                            <strong>Duration</strong>
                            <div className="text-muted">
                                {calculateTripDuration(post.startDate, post.endDate)} days
                            </div>
                        </div>
                        <div className="col-md-3 mb-3">
                            <strong>Budget per person</strong>
                            <div className="text-success fw-bold">${post.budget}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div className="card">
                <div className="card-header bg-light">
                    <h5 className="mb-0">
                        <FontAwesomeIcon icon={faUsers} className="me-2" />
                        Join the Conversation
                    </h5>
                </div>
                <div className="card-body">
                    <Comments noteId={id} showAlert={showAlert} />
                </div>
            </div>

            {/* Image Modal */}
            {showModal && selectedImage && (
                <div 
                    className="modal fade show" 
                    style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setShowModal(false)}
                >
                    <div className="modal-dialog modal-dialog-centered modal-xl">
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h5 className="modal-title">{post.title}</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowModal(false)}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body text-center">
                                <img 
                                    src={getImageUrl(selectedImage)} 
                                    alt={post.title}
                                    className="img-fluid"
                                    style={{ maxHeight: '80vh' }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Found";
                                    }}
                                />
                            </div>
                            <div className="modal-footer justify-content-center">
                                {allImages.length > 1 && (
                                    <div className="d-flex overflow-auto" style={{ maxWidth: '100%', gap: '10px' }}>
                                        {allImages.map((image, index) => (
                                            <img 
                                                key={index}
                                                src={getImageUrl(image)} 
                                                alt={`Tour ${index + 1}`}
                                                className={`rounded cursor-pointer ${selectedImage === image ? 'border border-primary border-3' : ''}`}
                                                style={{ 
                                                    width: '60px', 
                                                    height: '60px', 
                                                    objectFit: 'cover',
                                                    flexShrink: 0
                                                }}
                                                onClick={() => setSelectedImage(image)}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "https://via.placeholder.com/60x60?text=Image";
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Postcard;