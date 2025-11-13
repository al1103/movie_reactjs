import { useNavigate } from 'react-router-dom';
import { CommentManagement } from '../components/CommentManagement.jsx';
import { useAppData } from '../context/AppDataContext.jsx';
import { AdminHeader } from '../components/AdminHeader.jsx';
import './pages-modern.css';

export const AdminCommentsPage = () => {
  const navigate = useNavigate();
  const {
    state: { movies },
    adminActions,
    logout,
  } = useAppData();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="MOIVE-home">
      <AdminHeader scrolled={true} />

      <div className="admin-content">
        <div className="admin-hero">
          <h1>Quản lý Bình luận</h1>
          <p>Duyệt và quản lý các bình luận từ người dùng. Ẩn hoặc xóa những bình luận không phù hợp.</p>
        </div>
        <div className="admin-panel">
          <CommentManagement movies={movies} adminActions={adminActions} />
        </div>
      </div>
    </div>
  );
};
