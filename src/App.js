// src/App.js - Integrated with existing context providers
import './App.css';
import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import NoteState from './context/notes/NoteState';
import TourRequestsState from './context/tourRequests/TourRequestsState';
import CommentState from './context/comments/CommentState'; // Existing comment state
import UserState from './context/UserState'; // Existing user state
import { AuthProvider } from './context/authContext'; // Existing auth context
import Alert from './components/Alert';
import Signup from './components/Signup';
import Login from './components/Login';
import CreatePost from './components/CreatePost';
import Postcard from './components/Postcard';
import MyRequests from './components/MyRequests';

function App() {
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type) => {
    setAlert({
      msg: message,
      type: type
    });
    setTimeout(() => {
      setAlert(null);
    }, 1500);
  };

  return (
    <AuthProvider>
      <UserState>
        <NoteState>
          <TourRequestsState>
            <CommentState>
              <Router>
                <Navbar />
                <Alert alert={alert} />
                <div className="container">
                  <Routes>
                    <Route exact path="/" element={<Home showAlert={showAlert} />} />
                    <Route exact path="/about" element={<About />} />
                    <Route exact path="/login" element={<Login showAlert={showAlert} />} />
                    <Route exact path="/signup" element={<Signup showAlert={showAlert} />} />
                    <Route exact path="/createpost" element={<CreatePost showAlert={showAlert} />} />
                    <Route exact path="/post/:id" element={<Postcard showAlert={showAlert} />} />
                    <Route exact path="/my-requests" element={<MyRequests showAlert={showAlert} />} />
                    {/* Add other existing routes like /dashboard here */}
                  </Routes>
                </div>
              </Router>
            </CommentState>
          </TourRequestsState>
        </NoteState>
      </UserState>
    </AuthProvider>
  );
}

export default App;