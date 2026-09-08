import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Discussions from './pages/Discussions';
import Events from './pages/Events';
import EventRegister from './pages/EventRegister';
import LostFound from './pages/LostFound';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminAuth from './pages/AdminAuth';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userInfo, setUserInfo] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });

  if (!userInfo) {
    return (
      <Routes>
        <Route path="/login" element={<Login setUserInfo={setUserInfo} />} />
        <Route path="/register" element={<Register setUserInfo={setUserInfo} />} />
        <Route path="/admin-auth" element={<AdminAuth setUserInfo={setUserInfo} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout onSearch={setSearchQuery} userInfo={userInfo} setUserInfo={setUserInfo}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/notes" element={<Notes searchQuery={searchQuery} />} />
        <Route path="/discussions" element={<Discussions />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id/register" element={<EventRegister />} />
        <Route path="/lost-found" element={<LostFound />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin-auth" element={<AdminAuth setUserInfo={setUserInfo} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
