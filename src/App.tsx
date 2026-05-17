/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import TipsGuides from './pages/TipsGuides';
import RegisterTest from './pages/RegisterTest';
import TestCountdown from './pages/TestCountdown';
import MockTest from './pages/MockTest';
import PracticeMode from './pages/PracticeMode';
import PracticeSession from './pages/PracticeSession';
import Results from './pages/Results';
import Profile from './pages/Profile';
import Resources from './pages/Resources';
import RealTestSession from './pages/RealTestSession';
import FilfoAdmin from './pages/FilfoAdmin';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import ThemeToggle from './components/ThemeToggle';

export default function App() {
  return (
    <AuthProvider>
      
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Navigate to="/app" replace />} />
          <Route path="/signup" element={<Navigate to="/app" replace />} />

          {/* Protected Routes */}
          <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
          <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tips" element={<ProtectedRoute><TipsGuides /></ProtectedRoute>} />
          <Route path="/register-test" element={<ProtectedRoute><RegisterTest /></ProtectedRoute>} />
          <Route path="/test-start" element={<ProtectedRoute><TestCountdown /></ProtectedRoute>} />
          <Route path="/mock-test" element={<ProtectedRoute><MockTest /></ProtectedRoute>} />
          <Route path="/practice" element={<ProtectedRoute><PracticeMode /></ProtectedRoute>} />
          <Route path="/practice/:section" element={<ProtectedRoute><PracticeSession /></ProtectedRoute>} />
          <Route path="/real-test" element={<ProtectedRoute><RealTestSession /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/study-intel" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
          <Route path="/filfo" element={<ProtectedRoute><FilfoAdmin /></ProtectedRoute>} />

          {/* Default Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
