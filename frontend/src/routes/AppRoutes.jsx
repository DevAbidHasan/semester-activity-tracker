import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';
import StudentLayout from '../layouts/StudentLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardHome from '../pages/DashboardHome';
import Courses from '../pages/Courses';
import Assignments from '../pages/Assignments';
import Exams from '../pages/Exams';
import Schedule from '../pages/Schedule';
import SemesterTracker from '../pages/SemesterTracker';
import Notes from '../pages/Notes';
import Settings from '../pages/Settings';
import Admin from '../pages/Admin';

/** Old `/dashboard/*` URLs → `/student/*` */
function LegacyDashboardRedirect() {
  const { pathname } = useLocation();
  const rest = pathname.replace(/^\/dashboard\/?/, '');
  const to = rest ? `/student/${rest}` : '/student';
  return <Navigate to={to} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard/*" element={<LegacyDashboardRedirect />} />

      <Route element={<ProtectedRoute studentOnly />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="courses" element={<Courses />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="exams" element={<Exams />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="tracker" element={<SemesterTracker />} />
          <Route path="notes" element={<Notes />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Admin />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
