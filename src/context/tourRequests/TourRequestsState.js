// src/context/tourRequests/TourRequestsState.js - Updated to match your project structure
import React, { useState } from 'react';
import tourRequestsContext from './tourRequestsContext';

const TourRequestsState = (props) => {
    const host = "http://localhost:5000"; // Match your existing host configuration
    const [requestStatus, setRequestStatus] = useState({});
    const [joinRequests, setJoinRequests] = useState([]);
    const [tourMates, setTourMates] = useState([]);
    const [loading, setLoading] = useState(false);

    // Send join request
    const sendJoinRequest = async (tourId) => {
        setLoading(true);
        try {
            const response = await fetch(`${host}/api/tour-requests/send/${tourId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                }
            });

            const json = await response.json();
            
            if (json.success) {
                // Update request status for this tour
                setRequestStatus(prev => ({
                    ...prev,
                    [tourId]: {
                        ...prev[tourId],
                        requestStatus: 'pending'
                    }
                }));
            }

            return json;
        } catch (error) {
            console.error('Error sending join request:', error);
            return { success: false, error: 'Network error occurred' };
        } finally {
            setLoading(false);
        }
    };

    // Get request status for a specific tour
    const getRequestStatus = async (tourId) => {
        try {
            const response = await fetch(`${host}/api/tour-requests/status/${tourId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                }
            });

            const json = await response.json();
            
            if (json.success) {
                setRequestStatus(prev => ({
                    ...prev,
                    [tourId]: json
                }));
            }

            return json;
        } catch (error) {
            console.error('Error getting request status:', error);
            return { success: false, error: 'Network error occurred' };
        }
    };

    // Get all join requests for a tour (for tour creators)
    const getJoinRequests = async (tourId) => {
        setLoading(true);
        try {
            const response = await fetch(`${host}/api/tour-requests/manage/${tourId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                }
            });

            const json = await response.json();
            
            if (json.success) {
                setJoinRequests(json.joinRequests);
                setTourMates(json.tourMates);
            }

            return json;
        } catch (error) {
            console.error('Error getting join requests:', error);
            return { success: false, error: 'Network error occurred' };
        } finally {
            setLoading(false);
        }
    };

    // Respond to join request (accept/reject)
    const respondToRequest = async (tourId, requestId, action) => {
        setLoading(true);
        try {
            const response = await fetch(`${host}/api/tour-requests/respond/${tourId}/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({ action })
            });

            const json = await response.json();
            
            if (json.success) {
                // Update join requests list
                setJoinRequests(prev => 
                    prev.map(request => 
                        request._id === requestId 
                            ? { ...request, status: json.requestStatus, processedAt: new Date() }
                            : request
                    )
                );

                // If accepted, refresh tour mates (you might want to call getJoinRequests again)
                if (action === 'accept') {
                    await getJoinRequests(tourId);
                }
            }

            return json;
        } catch (error) {
            console.error('Error responding to request:', error);
            return { success: false, error: 'Network error occurred' };
        } finally {
            setLoading(false);
        }
    };

    // Get user's all join requests
    const getMyRequests = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${host}/api/tour-requests/my-requests`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                }
            });

            const json = await response.json();
            return json;
        } catch (error) {
            console.error('Error getting my requests:', error);
            return { success: false, error: 'Network error occurred' };
        } finally {
            setLoading(false);
        }
    };

    return (
        <tourRequestsContext.Provider value={{
            requestStatus,
            joinRequests,
            tourMates,
            loading,
            sendJoinRequest,
            getRequestStatus,
            getJoinRequests,
            respondToRequest,
            getMyRequests,
            setRequestStatus
        }}>
            {props.children}
        </tourRequestsContext.Provider>
    );
};

export default TourRequestsState;