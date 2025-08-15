import React, { useState, useEffect } from "react";
import UserContext from "./userContext";

const UserState = ({ children }) => {
    const [user, setUser] = useState(null); // Will hold full profile: { _id, name, phone, email, ... }

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
                    setUser(data); // Save full user object in context
                }
            } catch (err) {
                console.error("Error loading user profile:", err);
            }
        };

        fetchUserProfile();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserState;

