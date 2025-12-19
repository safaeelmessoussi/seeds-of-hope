
import { StrictMode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Public/Home';
import LevelContent from './pages/Public/LevelContent'; // Import new page
import ManageCalendar from './pages/Admin/ManageCalendar';
import ManageLevels from './pages/Admin/ManageLevels';
import ManageRooms from './pages/Admin/ManageRooms';
import ManageTeachers from './pages/Admin/ManageTeachers';
import ManageContent from './pages/Admin/ManageContent';
import ManageAdmins from './pages/Admin/ManageAdmins';
import ManageStudents from './pages/Admin/ManageStudents';
import GradeEntry from './pages/Admin/GradeEntry';
import Trash from './pages/Admin/Trash';
import { useAuth } from './context/AuthContext';

import PublicCalendar from './pages/Public/Calendar';
import Login from "./pages/Public/Login"; // Changed path for Login
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/level/:id" element={<LevelContent />} />
          <Route path="/calendar" element={<PublicCalendar />} />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={!currentUser ? <Login /> : <Navigate to="/admin" />}
          />

          {/* Admin Routes (Protected) */}
          <Route
            path="/admin/*"
            element={
              currentUser ? (
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="calendar" element={<ManageCalendar />} />
                  <Route path="levels" element={<ManageLevels />} />
                  <Route path="rooms" element={<ManageRooms />} />
                  <Route path="teachers" element={<ManageTeachers />} />
                  <Route path="content" element={<ManageContent />} />
                  <Route path="students" element={<ManageStudents />} />
                  <Route path="admins" element={<ManageAdmins />} />
                  <Route path="grades" element={<GradeEntry />} />
                  <Route path="trash" element={<Trash />} />
                  <Route path="*" element={<div className="text-center p-10">صفحة قيد التطوير</div>} />
                </Routes>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
