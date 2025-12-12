import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import LevelContent from './pages/LevelContent';
import Calendar from './pages/Calendar';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ManageLevels from './pages/admin/ManageLevels';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="level/:id" element={<LevelContent />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="login" element={<Login />} />
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="admin/levels" element={<ManageLevels />} />
      </Route>
    </Routes>
  );
}

export default App;
