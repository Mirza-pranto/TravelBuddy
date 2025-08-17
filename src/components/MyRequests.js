// src/components/MyRequests.js
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSpinner, 
    faCheck, 
    faTimes, 
    faClock, 
    faMapMarkerAlt,
    faCalendar,
    faUser,
    faEye
} from '@fortawesome/free-solid-svg-icons';
import tourRequestsContext from '../context/tourRequests/tourRequestsContext';

const MyRequests = ({ showAlert }) => {
    const context = useContext(tourRequestsContext);
    const { getMyRequests } = context;
    
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected

    useEffect(() => {
        const fetchMyRequests = async () => {
            setLoading(true);
            try {
                const result = await getMyRequests();
                if (result.success) {
                    setRequests(result.requests);
                } else {
                    showAlert && showAlert(result.error || 'Failed to fetch requests', 'error');
                }
            } catch (error) {
                console.error('Error fetching requests:', error);
                showAlert && showAlert('An error occurred while fetching requests', 'error');
            }
            setLoading(false);
        };

        fetchMyRequests();
    }, []);

    const getProfilePicUrl = (profilePic) => {
        if (!profilePic) return "https://via.placeholder.com/40?text=User";
        if (profilePic.startsWith('http')) return profilePic;
        return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${profilePic}`;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="badge bg-warning">
                        <FontAwesomeIcon icon={faClock} className="me-1" />
                        Pending
                    </span>
                );
            case 'accepted':
                return (
                    <span className="badge bg-success">
                        <FontAwesomeIcon icon={faCheck} className="me-1" />
                        Accepted
                    </span>
                );
            case 'rejected':
                return (
                    <span className="badge bg-danger">
                        <FontAwesomeIcon icon={faTimes} className="me-1" />
                        Rejected
                    </span>
                );
            default:
                return null;
        }
    };

    const filteredRequests = requests.filter(request => {
        if (filter === 'all') return true;
        return request.requestStatus === filter;
    });

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-primary" />
                <h3 className="mt-3">Loading your requests...</h3>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-12">
                    <h2 className="mb-4">My Tour Requests</h2>
                    
                    {/* Filter Tabs */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <ul className="nav nav-tabs card-header-tabs">
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${filter === 'all' ? 'active' : ''}`}
                                        onClick={() => setFilter('all')}
                                    >
                                        All Requests
                                        <span className="badge bg-secondary ms-2">
                                            {requests.length}
                                        </span>
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${filter === 'pending' ? 'active' : ''}`}
                                        onClick={() => setFilter('pending')}
                                    >
                                        <FontAwesomeIcon icon={faClock} className="me-1" />
                                        Pending
                                        <span className="badge bg-warning ms-2">
                                            {requests.filter(r => r.requestStatus === 'pending').length}
                                        </span>
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${filter === 'accepted' ? 'active' : ''}`}
                                        onClick={() => setFilter('accepted')}
                                    >
                                        <FontAwesomeIcon icon={faCheck} className="me-1" />
                                        Accepted
                                        <span className="badge bg-success ms-2">
                                            {requests.filter(r => r.requestStatus === 'accepted').length}
                                        </span>
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${filter === 'rejected' ? 'active' : ''}`}
                                        onClick={() => setFilter('rejected')}
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="me-1" />
                                        Rejected
                                        <span className="badge bg-danger ms-2">
                                            {requests.filter(r => r.requestStatus === 'rejected').length}
                                        </span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="card-body">
                            {filteredRequests.length === 0 ? (
                                <div className="text-center py-5">
                                    <FontAwesomeIcon 
                                        icon={
                                            filter === 'pending' ? faClock :
                                            filter === 'accepted' ? faCheck :
                                            filter === 'rejected' ? faTimes : faUser
                                        } 
                                        size="3x" 
                                        className="text-muted mb-3" 
                                    />
                                    <h5>
                                        {filter === 'all' 
                                            ? 'No Tour Requests Yet' 
                                            : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Requests`
                                        }
                                    </h5>
                                    <p className="text-muted">
                                        {filter === 'all'
                                            ? 'Start exploring tours and send join requests to connect with other travelers!'
                                            : `You don't have any ${filter} requests at the moment.`
                                        }
                                    </p>
                                    {filter === 'all' && (
                                        <Link to="/" className="btn btn-primary">
                                            Explore Tours
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="row">
                                    {filteredRequests.map((request) => (
                                        <div key={request.tourId} className="col-lg-6 mb-4">
                                            <div className={`card border h-100 ${
                                                request.requestStatus === 'accepted' ? 'border-success' :
                                                request.requestStatus === 'rejected' ? 'border-danger' :
                                                'border-warning'
                                            }`}>
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <h5 className="card-title mb-0">{request.tourTitle}</h5>
                                                        {getStatusBadge(request.requestStatus)}
                                                    </div>
                                                    
                                                    <div className="mb-3">
                                                        <div className="d-flex align-items-center mb-2">
                                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary me-2" />
                                                            <span>{request.destination}</span>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <FontAwesomeIcon icon={faCalendar} className="text-info me-2" />
                                                            <small className="text-muted">
                                                                {new Date(request.startDate).toLocaleDateString()} - 
                                                                {' '}{new Date(request.endDate).toLocaleDateString()}
                                                            </small>
                                                        </div>
                                                    </div>

                                                    {/* Tour Creator Info */}
                                                    <div className="d-flex align-items-center mb-3 p-2 bg-light rounded">
                                                        <img 
                                                            src={getProfilePicUrl(request.creator?.profilePic)} 
                                                            alt={request.creator?.name || 'Creator'}
                                                            className="rounded-circle me-2"
                                                            style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "https://via.placeholder.com/30?text=User";
                                                            }}
                                                        />
                                                        <div>
                                                            <small className="text-muted">Tour Creator</small>
                                                            <div className="fw-bold" style={{ fontSize: '0.9rem' }}>
                                                                {request.creator?.name || 'Unknown'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Request Timeline */}
                                                    <div className="mb-3">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <small className="text-muted">
                                                                <strong>Requested:</strong> {' '}
                                                                {new Date(request.requestedAt).toLocaleDateString()}
                                                            </small>
                                                            {request.processedAt && (
                                                                <small className="text-muted">
                                                                    <strong>Processed:</strong> {' '}
                                                                    {new Date(request.processedAt).toLocaleDateString()}
                                                                </small>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Action Button */}
                                                    <div className="d-flex gap-2">
                                                        <Link 
                                                            to={`/post/${request.tourId}`} 
                                                            className="btn btn-outline-primary btn-sm flex-grow-1"
                                                        >
                                                            <FontAwesomeIcon icon={faEye} className="me-1" />
                                                            View Tour
                                                        </Link>
                                                        
                                                        {request.requestStatus === 'accepted' && (
                                                            <button 
                                                                className="btn btn-success btn-sm"
                                                                disabled
                                                            >
                                                                <FontAwesomeIcon icon={faCheck} className="me-1" />
                                                                Joined
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyRequests;