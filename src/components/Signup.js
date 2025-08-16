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
    bio: ""
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        props.showAlert("File size should be less than 5MB", "danger");
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        props.showAlert("Please select a valid image file (JPEG, PNG, GIF, WEBP)", "danger");
        return;
      }
      
      setProfilePicFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePic = async () => {
    if (!profilePicFile) return null;
    
    const formData = new FormData();
    formData.append('profilePic', profilePicFile);
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/upload-profile-pic", {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      if (result.success) {
        return result.filePath; // This will be like "/uploads/profile-pics/filename.jpg"
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (credentials.password !== credentials.cpassword) {
      props.showAlert("Passwords do not match", "danger");
      return;
    }
    
    setUploading(true);
    
    try {
      const { name, email, password, nidNumber, phoneNumber, bio } = credentials;
      
      // Upload profile picture first if selected
      let profilePicPath = "";
      if (profilePicFile) {
        profilePicPath = await uploadProfilePic();
      }

      // Create user account
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
          profilePic: profilePicPath // Send the file path instead of URL
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
    } catch (error) {
      console.error('Signup error:', error);
      props.showAlert("Error creating account. Please try again.", "danger");
    } finally {
      setUploading(false);
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
          <input 
            type="text" 
            className="form-control" 
            name="name" 
            id="name" 
            value={credentials.name}
            onChange={onChange} 
            required 
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input 
            type="email" 
            className="form-control" 
            name="email" 
            id="email" 
            value={credentials.email}
            onChange={onChange} 
            required 
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="nidNumber" className="form-label">National ID Number</label>
          <input 
            type="text" 
            className="form-control" 
            name="nidNumber" 
            id="nidNumber" 
            value={credentials.nidNumber}
            onChange={onChange} 
            required 
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
          <input 
            type="tel" 
            className="form-control" 
            name="phoneNumber" 
            id="phoneNumber" 
            value={credentials.phoneNumber}
            onChange={onChange} 
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="bio" className="form-label">Bio</label>
          <textarea 
            className="form-control" 
            name="bio" 
            id="bio" 
            value={credentials.bio}
            onChange={onChange} 
            rows="3" 
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="profilePic" className="form-label">Profile Picture</label>
          <input 
            type="file" 
            className="form-control" 
            name="profilePic" 
            id="profilePic" 
            accept="image/*"
            onChange={handleFileChange}
          />
          <div className="form-text">
            Maximum file size: 5MB. Supported formats: JPEG, PNG, GIF, WEBP
          </div>
          
          {/* Image Preview */}
          {profilePicPreview && (
            <div className="mt-3">
              <label className="form-label">Preview:</label>
              <div>
                <img 
                  src={profilePicPreview} 
                  alt="Profile Preview" 
                  className="img-thumbnail"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input 
            type="password" 
            className="form-control" 
            name="password" 
            id="password" 
            value={credentials.password}
            onChange={onChange} 
            minLength={5} 
            required 
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="cpassword" className="form-label">Confirm Password</label>
          <input 
            type="password" 
            className="form-control" 
            name="cpassword" 
            id="cpassword" 
            value={credentials.cpassword}
            onChange={onChange} 
            minLength={5} 
            required 
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-success" 
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Creating Account...
            </>
          ) : (
            'SignUp'
          )}
        </button>
      </form>
    </div>
  );
};

export default Signup;