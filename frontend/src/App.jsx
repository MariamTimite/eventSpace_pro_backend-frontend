import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Spaces from './pages/Spaces';
import SpaceDetails from './pages/SpaceDetails';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Test from './pages/Test';
import CreateSpace from './pages/spaces/CreateSpace';
import EditSpace from './pages/spaces/EditSpace';
import EditBooking from './pages/bookings/EditBooking';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="min-h-screen flex flex-col w-full">
          <Navbar />
          <main className="flex-grow w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/test" element={<Test />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/spaces" element={<Spaces />} />
              <Route path="/spaces/create" element={<CreateSpace />} />
              <Route path="/spaces/edit/:id" element={<EditSpace />} />
              <Route path="/spaces/:id" element={<SpaceDetails />} />
              {/* Routes protégées */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              <Route path="/bookings/edit/:id" element={<EditBooking />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
