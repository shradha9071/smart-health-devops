import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientRegistration from './pages/PatientRegistration';
import TokenGeneration from './pages/TokenGeneration';
import QueueManagement from './pages/QueueManagement';
import AppointmentBooking from './pages/AppointmentBooking';
import DisplayBoard from './pages/DisplayBoard';
import { socket } from './api/axios';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        socket.connect();
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    socket.connect();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    socket.disconnect();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" replace />} 
      />
      <Route path="/display" element={<DisplayBoard />} />
      <Route 
        path="/dashboard" 
        element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/register-patient" 
        element={user ? <PatientRegistration /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/generate-token" 
        element={user && ['admin', 'receptionist'].includes(user.role) ? 
          <TokenGeneration /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/queue" 
        element={user && ['admin', 'receptionist'].includes(user.role) ? 
          <QueueManagement /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/appointments" 
        element={user ? <AppointmentBooking /> : <Navigate to="/login" replace />} 
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/demo" element={<Demo />} />
    </Routes>
  );
}

export default App;
// final trigger
