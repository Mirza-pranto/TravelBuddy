import React, { useState, useEffect } from "react";
import UserContext from "./userContext";

const UserState = ({ children }) => {
    const [user, setUser] = useState(null); // Will hold full profile: { _id, name, phone, email, profilePic, ... }

    // Helper function to get full profile picture URL
    const getProfilePicUrl = (profilePic) => {
        if (!profilePic) return "https://via.placeholder.com/150";
        if (profilePic.startsWith('http')) return profilePic; // External URL
        return `http://localhost:5000${profilePic}`; // Local file path
    };

    // Load user on page refresh if token exists
    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await fetch("http://localhost:5000/api/auth/getuser", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": token
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    // Add full profile picture URL to user data
                    const userWithFullPicUrl = {
                        ...data,
                        profilePicUrl: getProfilePicUrl(data.profilePic)
                    };
                    setUser(userWithFullPicUrl); // Save full user object in context
                }
            } catch (err) {
                console.error("Error loading user profile:", err);
            }
        };

        fetchUserProfile();
    }, []);

    // Update user data (for profile updates)
    const updateUser = (updatedUserData) => {
        const userWithFullPicUrl = {
            ...updatedUserData,
            profilePicUrl: getProfilePicUrl(updatedUserData.profilePic)
        };
        setUser(userWithFullPicUrl);
    };

    // Set user data (for login)
    const setUserData = (userData) => {
        const userWithFullPicUrl = {
            ...userData,
            profilePicUrl: getProfilePicUrl(userData.profilePic)
        };
        setUser(userWithFullPicUrl);
    };

    // Clear user data (for logout)
    const clearUser = () => {
        setUser(null);
    };

    // Refresh user data from server
    const refreshUser = async () => {
        const token = localStorage.getItem("token");
        if (!token) return false;

        try {
            const res = await fetch("http://localhost:5000/api/auth/getuser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token
                }
            });
            const data = await res.json();
            if (res.ok) {
                const userWithFullPicUrl = {
                    ...data,
                    profilePicUrl: getProfilePicUrl(data.profilePic)
                };
                setUser(userWithFullPicUrl);
                return true;
            }
        } catch (err) {
            console.error("Error refreshing user profile:", err);
        }
        return false;
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            setUser: setUserData,
            updateUser,
            clearUser,
            refreshUser,
            getProfilePicUrl 
        }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserState;