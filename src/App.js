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
import CommentState from './context/comments/CommentState';
import UserState from './context/UserState';
import { AuthProvider } from './context/authContext';
import Alert from './components/Alert';
import Signup from './components/Signup';
import Login from './components/Login';
import CreatePost from './components/CreatePost';
import Postcard from './components/Postcard';
import MyRequests from './components/MyRequests';
import Dashboard from './components/Dashboard';

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
                <div className="app-container">
                  <Navbar />
                  <Alert alert={alert} />
                  <div className="main-content container">
                    <Routes>
                      <Route exact path="/" element={<Home showAlert={showAlert} />} />
                      <Route exact path="/about" element={<About />} />
                      <Route exact path="/login" element={<Login showAlert={showAlert} />} />
                      <Route exact path="/signup" element={<Signup showAlert={showAlert} />} />
                      <Route exact path="/createpost" element={<CreatePost showAlert={showAlert} />} />
                      <Route exact path="/post/:id" element={<Postcard showAlert={showAlert} />} />
                      <Route exact path="/my-requests" element={<MyRequests showAlert={showAlert} />} />
                      <Route exact path="/dashboard" element={<Dashboard showAlert={showAlert} />} />
                    </Routes>
                  </div>
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