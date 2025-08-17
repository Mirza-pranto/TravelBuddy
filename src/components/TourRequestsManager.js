// src/components/TourRequestsManager.js
import React, { useContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCheck, 
    faTimes, 
    faUsers, 
    faClock, 
    faSpinner,
    faStar,
    faCalendar
} from '@fortawesome/free-solid-svg-icons';
import tourRequestsContext from '../context/tourRequests/tourRequestsContext';

const TourRequestsManager = ({ tourId, showAlert }) => {
    const context = useContext(tourRequestsContext);
    const { 
        joinRequests, 
        tourMates, 
        loading, 
        getJoinRequests, 
        respondToRequest 
    } = context;

    const [processingRequest, setProcessingRequest] = useState(null);
    const [activeTab, setActiveTab] = useState('requests');

    useEffect(() => {
        if (tourId) {
            getJoinRequests(tourId);
        }
    }, [tourId]);

    const handleResponse = async (requestId, action) => {
        setProcessingRequest(requestId);
        try {
            const result = await respondToRequest(tourId, requestId, action);
            
            if (result.success) {
                showAlert && showAlert(
                    `Request ${action}ed successfully!`, 
                    action === 'accept' ? 'success' : 'info'
                );
            } else {
                showAlert && showAlert(result.error || `Failed to ${action} request`, 'error');
            }
        } catch (error) {
            console.error(`Error ${action}ing request:`, error);
            showAlert && showAlert(`An error occurred while ${action}ing the request`, 'error');
        }
        setProcessingRequest(null);
    };

    const getProfilePicUrl = (profilePic) => {
        if (!profilePic) return "https://via.placeholder.com/50?text=User";
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
            <div className="text-center py-4">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-primary" />
                <p className="mt-2">Loading requests...</p>
            </div>
        );
    }

    const pendingRequests = joinRequests.filter(req => req.status === 'pending');
    const processedRequests = joinRequests.filter(req => req.status !== 'pending');

    return (
        <div className="card">
            <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
                            onClick={() => setActiveTab('requests')}
                        >
                            <FontAwesomeIcon icon={faClock} className="me-2" />
                            Pending Requests
                            {pendingRequests.length > 0 && (
                                <span className="badge bg-warning ms-2">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === 'mates' ? 'active' : ''}`}
                            onClick={() => setActiveTab('mates')}
                        >
                            <FontAwesomeIcon icon={faUsers} className="me-2" />
                            Tour Mates
                            {tourMates.length > 0 && (
                                <span className="badge bg-success ms-2">
                                    {tourMates.length}
                                </span>
                            )}
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            <FontAwesomeIcon icon={faCalendar} className="me-2" />
                            Request History
                        </button>
                    </li>
                </ul>
            </div>
            
            <div className="card-body">
                {/* Pending Requests Tab */}
                {activeTab === 'requests' && (
                    <div>
                        {pendingRequests.length === 0 ? (
                            <div className="text-center py-4">
                                <FontAwesomeIcon icon={faClock} size="3x" className="text-muted mb-3" />
                                <h5>No Pending Requests</h5>
                                <p className="text-muted">
                                    When people request to join your tour, they'll appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="row">
                                {pendingRequests.map((request) => (
                                    <div key={request._id} className="col-md-6 mb-3">
                                        <div className="card border">
                                            <div className="card-body">
                                                <div className="d-flex align-items-center mb-3">
                                                    <img 
                                                        src={getProfilePicUrl(request.user.profilePic)} 
                                                        alt={request.user.name}
                                                        className="rounded-circle me-3"
                                                        style={{ 
                                                            width: '50px', 
                                                            height: '50px', 
                                                            objectFit: 'cover' 
                                                        }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "https://via.placeholder.com/50?text=User";
                                                        }}
                                                    />
                                                    <div className="flex-grow-1">
                                                        <h6 className="mb-1 fw-bold">{request.user.name}</h6>
                                                        <p className="mb-1 text-muted small">{request.user.email}</p>
                                                        {request.user.averageRating > 0 && (
                                                            <div className="d-flex align-items-center">
                                                                <div className="me-2">
                                                                    {renderStars(request.user.averageRating)}
                                                                </div>
                                                                <small className="text-muted">
                                                                    ({request.user.totalRatings} reviews)
                                                                </small>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="mb-3">
                                                    <small className="text-muted">
                                                        Requested on {new Date(request.requestedAt).toLocaleDateString()}
                                                    </small>
                                                </div>
                                                
                                                <div className="d-flex gap-2">
                                                    <button 
                                                        className="btn btn-success btn-sm flex-grow-1"
                                                        onClick={() => handleResponse(request._id, 'accept')}
                                                        disabled={processingRequest === request._id}
                                                    >
                                                        {processingRequest === request._id ? (
                                                            <FontAwesomeIcon icon={faSpinner} spin className="me-1" />
                                                        ) : (
                                                            <FontAwesomeIcon icon={faCheck} className="me-1" />
                                                        )}
                                                        Accept
                                                    </button>
                                                    <button 
                                                        className="btn btn-outline-danger btn-sm flex-grow-1"
                                                        onClick={() => handleResponse(request._id, 'reject')}
                                                        disabled={processingRequest === request._id}
                                                    >
                                                        {processingRequest === request._id ? (
                                                            <FontAwesomeIcon icon={faSpinner} spin className="me-1" />
                                                        ) : (
                                                            <FontAwesomeIcon icon={faTimes} className="me-1" />
                                                        )}
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tour Mates Tab */}
                {activeTab === 'mates' && (
                    <div>
                        {tourMates.length === 0 ? (
                            <div className="text-center py-4">
                                <FontAwesomeIcon icon={faUsers} size="3x" className="text-muted mb-3" />
                                <h5>No Tour Mates Yet</h5>
                                <p className="text-muted">
                                    Accept join requests to build your tour team.
                                </p>
                            </div>
                        ) : (
                            <div className="row">
                                {tourMates.map((mate) => (
                                    <div key={mate._id} className="col-md-4 mb-3">
                                        <div className="card border-success">
                                            <div className="card-body text-center">
                                                <img 
                                                    src={getProfilePicUrl(mate.profilePic)} 
                                                    alt={mate.name}
                                                    className="rounded-circle mb-3"
                                                    style={{ 
                                                        width: '60px', 
                                                        height: '60px', 
                                                        objectFit: 'cover' 
                                                    }}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://via.placeholder.com/60?text=User";
                                                    }}
                                                />
                                                <h6 className="mb-1 fw-bold">{mate.name}</h6>
                                                <p className="mb-2 text-muted small">{mate.email}</p>
                                                {mate.averageRating > 0 && (
                                                    <div className="d-flex align-items-center justify-content-center mb-2">
                                                        <div className="me-2">
                                                            {renderStars(mate.averageRating)}
                                                        </div>
                                                        <small className="text-muted">
                                                            ({mate.totalRatings})
                                                        </small>
                                                    </div>
                                                )}
                                                <span className="badge bg-success">
                                                    <FontAwesomeIcon icon={faCheck} className="me-1" />
                                                    Tour Mate
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Request History Tab */}
                {activeTab === 'history' && (
                    <div>
                        {processedRequests.length === 0 ? (
                            <div className="text-center py-4">
                                <FontAwesomeIcon icon={faCalendar} size="3x" className="text-muted mb-3" />
                                <h5>No Request History</h5>
                                <p className="text-muted">
                                    Processed requests will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Requested Date</th>
                                            <th>Processed Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {processedRequests.map((request) => (
                                            <tr key={request._id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <img 
                                                            src={getProfilePicUrl(request.user.profilePic)} 
                                                            alt={request.user.name}
                                                            className="rounded-circle me-2"
                                                            style={{ 
                                                                width: '40px', 
                                                                height: '40px', 
                                                                objectFit: 'cover' 
                                                            }}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "https://via.placeholder.com/40?text=User";
                                                            }}
                                                        />
                                                        <div>
                                                            <div className="fw-bold">{request.user.name}</div>
                                                            <small className="text-muted">{request.user.email}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <small>
                                                        {new Date(request.requestedAt).toLocaleDateString()}
                                                    </small>
                                                </td>
                                                <td>
                                                    <small>
                                                        {request.processedAt 
                                                            ? new Date(request.processedAt).toLocaleDateString()
                                                            : 'N/A'
                                                        }
                                                    </small>
                                                </td>
                                                <td>
                                                    <span className={`badge ${
                                                        request.status === 'accepted' 
                                                            ? 'bg-success' 
                                                            : 'bg-danger'
                                                    }`}>
                                                        {request.status === 'accepted' 
                                                            ? <FontAwesomeIcon icon={faCheck} className="me-1" />
                                                            : <FontAwesomeIcon icon={faTimes} className="me-1" />
                                                        }
                                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TourRequestsManager;