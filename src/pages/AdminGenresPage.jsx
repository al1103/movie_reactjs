import { useNavigate } from 'react-router-dom';
import { GenreManagement } from '../components/GenreManagement.jsx';
import { useAppData } from '../context/AppDataContext.jsx';
import { AdminHeader } from '../components/AdminHeader.jsx';
import './pages-modern.css';

export const AdminGenresPage = () => {
  const navigate = useNavigate();
  const {
    state: { genres },
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
          <h1>Quản lý Thể loại</h1>
          <p>Thêm hoặc xóa các thể loại phim. Các thể loại này sẽ được sử dụng để phân loại phim và lọc tìm kiếm.</p>
        </div>
        <div className="admin-panel">
          <GenreManagement genres={genres} adminActions={adminActions} />
        </div>
      </div>
    </div>
  );
};
