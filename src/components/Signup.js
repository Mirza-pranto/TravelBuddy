import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = (props) => {
  const [credentials, setCredentials] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    cpassword: "",
    nidNumber: "",
    phoneNumber: "",
    bio: "",
    profilePic: ""
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, nidNumber, phoneNumber, bio, profilePic } = credentials;

    const response = await fetch("http://localhost:5000/api/auth/createuser", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        name, 
        email, 
        password, 
        nidNumber, 
        phoneNumber, 
        bio, 
        profilePic 
      })
    });

    const json = await response.json();

    if (json.success) {
      localStorage.setItem('token', json.authtoken);
      navigate("/");
      props.showAlert("Account created successfully", "success");
    } else {
      props.showAlert(json.error || "Invalid credentials", "danger");
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mt-3">
      <h2>Create an Account to use TravelBuddy</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input type="text" className="form-control" name="name" id="name" onChange={onChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input type="email" className="form-control" name="email" id="email" onChange={onChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="nidNumber" className="form-label">National ID Number</label>
          <input type="text" className="form-control" name="nidNumber" id="nidNumber" onChange={onChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
          <input type="tel" className="form-control" name="phoneNumber" id="phoneNumber" onChange={onChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="bio" className="form-label">Bio</label>
          <textarea className="form-control" name="bio" id="bio" onChange={onChange} rows="3" />
        </div>
        <div className="mb-3">
          <label htmlFor="profilePic" className="form-label">Profile Picture URL</label>
          <input type="text" className="form-control" name="profilePic" id="profilePic" onChange={onChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input type="password" className="form-control" name="password" id="password" onChange={onChange} minLength={5} required />
        </div>
        <div className="mb-3">
          <label htmlFor="cpassword" className="form-label">Confirm Password</label>
          <input type="password" className="form-control" name="cpassword" id="cpassword" onChange={onChange} minLength={5} required />
        </div>
        <button type="submit" className="btn btn-success">SignUp</button>
      </form>
    </div>
  );
};

export default Signup;