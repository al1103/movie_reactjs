import { NavLink, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext.jsx';
import './layout-modern.css';
import './panel.css';
import { Button } from './ui/index.js';

const navLinkClass = ({ isActive }) =>
  isActive ? 'app-nav-link app-nav-link--active' : 'app-nav-link';

export const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const { currentUser, stats, logout } = useAppData();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <div className="app-background" />
      <header className="app-header">
        <div className="app-brand-section">
          <NavLink to="/" className="app-brand">
            <span role="img" aria-label="Projector">
              🎬
            </span>
            <div>
              <strong>CineVerse</strong>
              <small>Kho phim tương tác</small>
            </div>
          </NavLink>
        </div>

        <nav className="app-nav">
          <NavLink to="/" end className={navLinkClass}>
            🎭 Khám phá
          </NavLink>
          {currentUser && (
            <>
              <NavLink to="/my-favorites" className={navLinkClass}>
                ❤️ Yêu thích
              </NavLink>
              <NavLink to="/history" className={navLinkClass}>
                📺 Lịch sử
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                👤 Hồ sơ
              </NavLink>
            </>
          )}
          {currentUser?.role === 'admin' && (
            <div className="app-nav-submenu">
              <NavLink to="/admin" className={navLinkClass}>
                ⚙️ Quản trị
              </NavLink>
              <div className="app-nav-dropdown">
                <NavLink to="/admin/movies" className="app-dropdown-link">
                  📽️ Phim
                </NavLink>
                <NavLink to="/admin/genres" className="app-dropdown-link">
                  🎭 Thể loại
                </NavLink>
        
                <NavLink to="/admin/users" className="app-dropdown-link">
                  👨‍💼 Người dùng
                </NavLink>
             
              </div>
            </div>
          )}
        </nav>

        {currentUser && (
          <div className="app-user-menu">
            <div className="user-info">
              <div className="user-avatar">{currentUser.name.charAt(0).toUpperCase()}</div>
              <div>
                <p className="user-name">{currentUser.name}</p>
                <p className="user-role">{currentUser.role === 'admin' ? '👑 Admin' : '👤 Thành viên'}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              🚪 Đăng xuất
            </Button>
          </div>
        )}
      </header>

      <main className="app-main">
        <section className="app-content">{children}</section>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div>
            <strong>CineVerse</strong>
            <p>Khám phá điện ảnh, Kết nối cảm xúc</p>
          </div>
          <div className="footer-stats">
            <div>
              <strong>{stats.totalMovies}</strong>
              <span>Phim</span>
            </div>
            <div>
              <strong>{stats.totalUsers}</strong>
              <span>Người dùng</span>
            </div>
            <div>
              <strong>{stats.totalViews.toLocaleString('vi-VN')}</strong>
              <span>Lượt xem</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} CineVerse. Tất cả quyền được bảo vệ.</span>
        </div>
      </footer>
    </div>
  );
};
