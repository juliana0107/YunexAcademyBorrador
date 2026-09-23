import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { UserListPage } from '@/features/users/pages/UserListPage';
import { TrainingCourseListPage } from '@/features/training-courses/pages/TrainingCourseListPage';
import { TrainingCourseDetailPage } from '@/features/training-courses/pages/TrainingCourseDetailPage';
import { SubmoduleDetailPage } from '@/features/videos/pages/SubmoduleDetailPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UserListPage />} />
            <Route path="/training-courses" element={<TrainingCourseListPage />} />
            <Route path="/training-courses/:id" element={<TrainingCourseDetailPage />} />
            <Route path="/submodules/:submoduleId" element={<SubmoduleDetailPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}