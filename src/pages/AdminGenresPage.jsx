import { useNavigate } from 'react-router-dom';
import { GenreManagement } from '../components/GenreManagement.jsx';
import { useAppData } from '../context/AppDataContext.jsx';
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
    <div className="netflix-home">
      <header className="netflix-header scrolled">
        <div className="header-left">
          <div className="netflix-logo" onClick={() => navigate('/')}>NETFLIX</div>
          <nav className="header-nav">
            <button onClick={() => navigate('/')} className="nav-link">Home</button>
            <button onClick={() => navigate('/admin/movies')} className="nav-link">Movies</button>
            <button onClick={() => navigate('/admin/genres')} className="nav-link active">Genres</button>
            <button onClick={() => navigate('/admin/actors')} className="nav-link">Actors</button>
            <button onClick={() => navigate('/admin/users')} className="nav-link">Users</button>
            <button onClick={() => navigate('/admin/comments')} className="nav-link">Comments</button>
            <button onClick={() => navigate('/admin/stats')} className="nav-link">Stats</button>
          </nav>
        </div>
        <div className="header-right">
          <div className="user-menu">
            <div className="user-profile">
              <img src="https://i.pravatar.cc/40" alt="User" />
            </div>
            <div className="user-dropdown">
              <button onClick={() => navigate('/profile')} className="dropdown-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeWidth="2"/>
                </svg>
                Profile
              </button>
              <button onClick={handleLogout} className="dropdown-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeWidth="2"/>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

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
