import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TeacherPortal from './pages/TeacherPortal';
import StudentPortal from './pages/StudentPortal';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentsManagement from './pages/StudentsManagement';
import StudentDashboard from './pages/StudentDashboard';
import SeatingPlanPage from './pages/SeatingPlanPage';
import WheelOfNamesPage from './pages/WheelOfNamesPage';
import { AuthProvider } from './contexts/AuthContext';
import { StudentAuthProvider } from './contexts/StudentAuthContext';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <StudentAuthProvider>
          <Routes>
            <Route path="/teacherportal" element={<TeacherPortal />} />
            <Route path="/teacherportal/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacherportal/class/:classId/students" element={<StudentsManagement />} />
            <Route path="/teacherportal/class/:classId/seating" element={<SeatingPlanPage />} />
            <Route path="/teacherportal/class/:classId/wheel" element={<WheelOfNamesPage />} />
            <Route path="/studentportal" element={<StudentPortal />} />
            <Route path="/studentportal/dashboard" element={<StudentDashboard />} />
          </Routes>
        </StudentAuthProvider>
      </AuthProvider>
    </Router>
  );
}