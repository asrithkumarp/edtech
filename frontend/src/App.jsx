import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MentorDashboard from "./pages/MentorDashboard";
import StudentDashboard from "./pages/StudentDashboard";
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
  path="/mentor"
  element={
    <ProtectedRoute allowedRole="Mentor">
      <MentorDashboard />
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
