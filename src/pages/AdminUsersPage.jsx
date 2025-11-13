import { useNavigate } from 'react-router-dom';
import { UserManagement } from '../components/UserManagement.jsx';
import { useAppData } from '../context/AppDataContext.jsx';
import { AdminHeader } from '../components/AdminHeader.jsx';
import './pages-modern.css';

export const AdminUsersPage = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    state: { users },
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
          <h1>Quản lý Người dùng</h1>
          <p>Quản lý các tài khoản người dùng trong hệ thống. Cấp quyền admin hoặc xóa tài khoản khi cần.</p>
        </div>
        <div className="admin-panel">
          <UserManagement users={users} currentUser={currentUser} adminActions={adminActions} />
        </div>
      </div>
    </div>
  );
};
