import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { StudentRoute } from './components/StudentRoute';
import { RootRedirect } from './components/RootRedirect';
import { AppShell } from './components/AppShell';
import { AdminRoute } from './components/AdminRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { TopicPage } from './pages/TopicPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { AdminCoursePage } from './pages/AdminCoursePage';
import { NotFoundPage } from './pages/NotFoundPage';
import './styles.css';

const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            element: <StudentRoute />,
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/courses', element: <CoursesPage /> },
              { path: '/courses/:courseSlug', element: <CourseDetailPage /> },
              { path: '/topics/:topicId', element: <TopicPage /> },
              { path: '/profile', element: <ProfilePage /> },
            ],
          },
          {
            element: <AdminRoute />,
            children: [
              { path: '/admin', element: <AdminPage /> },
              { path: '/admin/courses/:courseSlug', element: <AdminCoursePage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);
