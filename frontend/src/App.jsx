import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MentorDashboard from "./pages/MentorDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";
import MentorProfile from "./pages/MentorProfile";
import MentorLeaderboard from "./pages/MentorLeaderboard";
import Debug from "./pages/Debug";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/debug" element={<Debug />} />

        {/* Protected Student Route */}
        <Route
  path="/student"
  element={
    <ProtectedRoute allowedRole="Student">
      <StudentDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/student/profile"
  element={
    <ProtectedRoute allowedRole="Student">
      <StudentProfile />
    </ProtectedRoute>
  }
/>

<Route
  path="/mentors/leaderboard"
  element={
    <ProtectedRoute allowedRole="Student">
      <MentorLeaderboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/mentor"
  element={
    <ProtectedRoute allowedRole="Mentor">
      <MentorDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/mentor/profile"
  element={
    <ProtectedRoute allowedRole="Mentor">
      <MentorProfile />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRole="Admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/analytics"
  element={
    <ProtectedRoute allowedRole="Admin">
      <AnalyticsDashboard />
    </ProtectedRoute>
  }
/>



      </Routes>
    </BrowserRouter>
  );
}

export default App;
