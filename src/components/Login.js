import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import UserContext from '../context/userContext';

const Login = (props) => {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { setUser } = useContext(UserContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

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
                const { authtoken } = json;

                // Save token first
                localStorage.setItem("token", authtoken);

                // Fetch complete user profile
                const profileRes = await fetch("http://localhost:5000/api/auth/getuser", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": authtoken
                    }
                });

                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    
                    // Set user data in both contexts
                    login(profileData, authtoken); // AuthContext for basic auth
                    setUser(profileData); // UserContext for detailed user data
                    
                    props.showAlert("Login successful", "success");
                    navigate("/");
                } else {
                    props.showAlert("Failed to load profile data", "danger");
                }
            } else {
                props.showAlert(json.error || "Invalid credentials", "danger");
            }
        } catch (err) {
            console.error("Login error:", err);
            props.showAlert("Something went wrong. Try again later.", "danger");
        } finally {
            setLoading(false);
        }
    };

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <h2 className="card-title">Welcome Back!</h2>
                                <p className="text-muted">Login to TravelBuddy</p>
                            </div>
                            
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
                                        disabled={loading}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="password"
                                        value={credentials.password}
                                        id="password"
                                        onChange={onChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="btn btn-success w-100"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Logging in...
                                        </>
                                    ) : (
                                        'Login'
                                    )}
                                </button>
                            </form>
                            
                            <div className="text-center mt-4">
                                <p className="text-muted">
                                    Don't have an account? 
                                    <a href="/signup" className="text-success ms-1">Sign up here</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;