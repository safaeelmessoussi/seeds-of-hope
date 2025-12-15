import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import LevelContent from './pages/LevelContent';
import Calendar from './pages/Calendar';
import AdminDashboard from './pages/AdminDashboard'; // Correct path
import ManageLevels from './pages/admin/ManageLevels';
import ManageContent from './pages/admin/ManageContent';
import ManageCalendar from './pages/admin/ManageCalendar';
import Trash from './pages/admin/Trash';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageRooms from './pages/admin/ManageRooms';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout'; // Import the new Layout component

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/level/:levelId" element={<Layout><LevelContent /></Layout>} />
        <Route path="/calendar" element={<Layout><Calendar /></Layout>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
        <Route path="/admin/levels" element={<ProtectedRoute><Layout><ManageLevels /></Layout></ProtectedRoute>} />
        <Route path="/admin/content" element={<ProtectedRoute><Layout><ManageContent /></Layout></ProtectedRoute>} />
        <Route path="/admin/calendar" element={<ProtectedRoute><Layout><ManageCalendar /></Layout></ProtectedRoute>} />
        <Route path="/admin/teachers" element={<ProtectedRoute><Layout><ManageTeachers /></Layout></ProtectedRoute>} />
        <Route path="/admin/rooms" element={<ProtectedRoute><Layout><ManageRooms /></Layout></ProtectedRoute>} />
        <Route path="/admin/trash" element={<ProtectedRoute><Layout><Trash /></Layout></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
