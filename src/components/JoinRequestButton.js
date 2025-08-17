// src/components/JoinRequestButton.js
import React, { useContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUserPlus, 
    faClock, 
    faCheck, 
    faTimes,
    faSpinner,
    faUsers
} from '@fortawesome/free-solid-svg-icons';
import tourRequestsContext from '../context/tourRequests/tourRequestsContext';

const JoinRequestButton = ({ tourId, showAlert, className = "" }) => {
    const context = useContext(tourRequestsContext);
    const { 
        requestStatus, 
        sendJoinRequest, 
        getRequestStatus, 
        loading 
    } = context;

    const [buttonLoading, setButtonLoading] = useState(false);
    const tourStatus = requestStatus[tourId];

    useEffect(() => {
        if (tourId) {
            getRequestStatus(tourId);
        }
    }, [tourId]);

    const handleJoinRequest = async () => {
        if (!localStorage.getItem('token')) {
            showAlert && showAlert('Please login to join tours', 'error');
            return;
        }

        setButtonLoading(true);
        try {
            const result = await sendJoinRequest(tourId);
            
            if (result.success) {
                showAlert && showAlert('Join request sent successfully!', 'success');
            } else {
                showAlert && showAlert(result.error || 'Failed to send join request', 'error');
            }
        } catch (error) {
            console.error('Error sending join request:', error);
            showAlert && showAlert('An error occurred while sending the request', 'error');
        }
        setButtonLoading(false);
    };

    // Don't show button if user is the creator
    if (tourStatus?.isCreator) {
        return (
            <button className={`btn btn-info ${className}`} disabled>
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Your Tour
            </button>
        );
    }

    // Show different button states based on request status
    if (tourStatus?.isTourMate) {
        return (
            <button className={`btn btn-success ${className}`} disabled>
                <FontAwesomeIcon icon={faCheck} className="me-2" />
                Tour Member
            </button>
        );
    }

    if (tourStatus?.requestStatus === 'pending') {
        return (
            <button className={`btn btn-warning ${className}`} disabled>
                <FontAwesomeIcon icon={faClock} className="me-2" />
                Request Pending
            </button>
        );
    }

    if (tourStatus?.requestStatus === 'rejected') {
        return (
            <button 
                className={`btn btn-outline-primary ${className}`}
                onClick={handleJoinRequest}
                disabled={buttonLoading || loading}
            >
                {buttonLoading ? (
                    <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                ) : (
                    <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                )}
                Request Again
            </button>
        );
    }

    // Check if tour is full
    if (tourStatus?.isFull) {
        return (
            <button className={`btn btn-secondary ${className}`} disabled>
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Tour Full ({tourStatus.totalMates}/{tourStatus.totalMates})
            </button>
        );
    }

    // Default: Show join button
    return (
        <button 
            className={`btn btn-success ${className}`}
            onClick={handleJoinRequest}
            disabled={buttonLoading || loading}
        >
            {buttonLoading ? (
                <>
                    <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                    Sending...
                </>
            ) : (
                <>
                    <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                    Request to Join
                    {tourStatus?.availableSpots !== undefined && (
                        <span className="ms-1">
                            ({tourStatus.availableSpots} spots left)
                        </span>
                    )}
                </>
            )}
        </button>
    );
};

export default JoinRequestButton;