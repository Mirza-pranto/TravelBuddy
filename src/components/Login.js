import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext'; // ✅ Import your AuthContext hook

const Login = (props) => {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const navigate = useNavigate();
    const { login } = useAuth(); // ✅ Get login function from AuthContext

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password
                })
            });

            const json = await response.json();

            if (json.success) {
                const { user, authtoken } = json;

                // ✅ Save token
                localStorage.setItem("token", authtoken);

                if (user) {
                    // ✅ If backend already sends full user profile
                    login(user, authtoken);
                } else {
                    // ✅ Otherwise fetch profile from getuser route
                    const profileRes = await fetch("http://localhost:5000/api/auth/getuser", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "auth-token": authtoken
                        }
                    });
                    const profileData = await profileRes.json();
                    login(profileData, authtoken);
                }

                props.showAlert("Login successful", "success");
                navigate("/");
            } else {
                props.showAlert("Invalid credentials", "danger");
            }
        } catch (err) {
            console.error("Login error:", err);
            props.showAlert("Something went wrong. Try again later.", "danger");
        }
    };

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Login to TravelBuddy</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={credentials.email}
                        id="email"
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={credentials.password}
                        id="password"
                        onChange={onChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-success">Login</button>
            </form>
        </div>
    );
};

export default Login;
