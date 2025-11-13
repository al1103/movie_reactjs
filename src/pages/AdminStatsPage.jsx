import { useNavigate } from 'react-router-dom';
import { StatsDisplay } from '../components/StatsDisplay.jsx';
import { useAppData } from '../context/AppDataContext.jsx';
import { AdminHeader } from '../components/AdminHeader.jsx';
import './pages-modern.css';

export const AdminStatsPage = () => {
  const navigate = useNavigate();
  const { stats, logout } = useAppData();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="MOIVE-home">
      <AdminHeader scrolled={true} />

      <div className="admin-content">
        <div className="admin-hero">
          <h1>Thống kê Hệ thống</h1>
          <p>Xem tổng quan về hoạt động của hệ thống. Theo dõi số lượng phim, người dùng, lượt xem và phim được xem nhiều nhất.</p>
        </div>
        <div className="admin-panel">
          <StatsDisplay stats={stats} />
        </div>
      </div>
    </div>
  );
};
