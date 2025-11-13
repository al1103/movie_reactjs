import { useNavigate } from 'react-router-dom';
import { ActorManagement } from '../components/ActorManagement.jsx';
import { useAppData } from '../context/AppDataContext.jsx';
import { AdminHeader } from '../components/AdminHeader.jsx';
import './pages-modern.css';

export const AdminActorsPage = () => {
  const navigate = useNavigate();
  const {
    state: { actors },
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
          <h1>Quản lý Diễn viên</h1>
          <p>Quản lý danh sách diễn viên. Thêm diễn viên mới hoặc cập nhật thông tin của những diễn viên hiện có.</p>
        </div>
        <div className="admin-panel">
          <ActorManagement actors={actors} adminActions={adminActions} />
        </div>
      </div>
    </div>
  );
};
