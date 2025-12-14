import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/feed" element={<Feed />} />
      <Route path="/create" element={<CreatePost />} />
      {/* New Profile Route */}
      <Route path="/profile/:username" element={<Profile />} />
      <Route path="/notifications" element={<Notifications />} />
    </Routes>
  );
}

export default App;