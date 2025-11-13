import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AppDataProvider } from './context/AppDataContext.jsx';
import { AdminActorsPage } from './pages/AdminActorsPage.jsx';
import { AdminGenresPage } from './pages/AdminGenresPage.jsx';
import { AdminMoviesPage } from './pages/AdminMoviesPage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';
import { AdminUsersPage } from './pages/AdminUsersPage.jsx';
import { AuthPage } from './pages/AuthPage.jsx';
import { FavoritesPage } from './pages/FavoritesPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { MovieDetailPage } from './pages/MovieDetailPage.jsx';
import { UserFavoritesPage } from './pages/UserFavoritesPage.jsx';

import { UserProfilePage } from './pages/UserProfilePage.jsx';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes - No Layout */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />

        {/* Home Page - No Layout (has own header) */}
        <Route path="/" element={<HomePage />} />

        {/* Movie Detail - No Layout (has own header) */}
        <Route path="/movie/:id" element={<MovieDetailPage />} />

        {/* Legacy Routes */}
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/admin" element={<AdminPage />} />

        {/* Admin Routes - No Layout (has own header) */}
        <Route
          path="/admin/movies"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminMoviesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/genres"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminGenresPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/actors"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminActorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        {/* User Routes - No Layout (has own header) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-favorites"
          element={
            <ProtectedRoute>
              <UserFavoritesPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <AppDataProvider>
    <AppRoutes />
  </AppDataProvider>
);

export default App;
