import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Login = (props) => {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: credentials.email, password: credentials.password })
        });
        const json = await response.json();
        if (json.success) {
            localStorage.setItem('token', json.authtoken);
            navigate("/");
            props.showAlert("Login successful", "success");
        } else {
            props.showAlert("Invalid credentials", "danger");
        }
    };
    const onChange = (e) => {
        setCredentials({...credentials, [e.target.name]: e.target.value})
    }

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


}

export default Login
