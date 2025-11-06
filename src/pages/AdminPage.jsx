import { Navigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext.jsx';
import './pages.css';

export const AdminPage = () => {
  const { currentUser } = useAppData();

  // Redirect non-admins
  if (!currentUser?.role === 'admin') {
    return <Navigate to="/" replace />;
  }

  // Redirect to admin movies page
  return <Navigate to="/admin/movies" replace />;
};
