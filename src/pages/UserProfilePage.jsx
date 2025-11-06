import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext.jsx';
import './pages-modern.css';

export const UserProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAppData();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="netflix-home">
      <header className="netflix-header scrolled">
        <div className="header-left">
          <div className="netflix-logo" onClick={() => navigate('/')}>NETFLIX</div>
          <nav className="header-nav">
            <button onClick={() => navigate('/')} className="nav-link">Home</button>
            <button onClick={() => navigate('/my-favorites')} className="nav-link">My List</button>
            <button onClick={() => navigate('/my-history')} className="nav-link">History</button>
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
              {currentUser.role === 'admin' && (
                <button onClick={() => navigate('/admin/movies')} className="dropdown-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2"/>
                  </svg>
                  Admin Panel
                </button>
              )}
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
          <h1>Hồ sơ cá nhân</h1>
          <p>Xem và quản lý thông tin tài khoản của bạn</p>
        </div>
        <div className="admin-panel">
          <div className="user-profile-modern">
            {/* Profile Header Card */}
            <div className="profile-header-card">
              <div className="profile-avatar-large">
                {currentUser.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="profile-header-info">
                <h2>{currentUser.name}</h2>
                <div className="profile-role-badge">
                  {currentUser.role === 'admin' ? (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Quản trị viên
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeWidth="2"/>
                      </svg>
                      Thành viên
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="profile-stats-grid">
              <div className="profile-stat-card favorites-stat">
                <div className="stat-icon-profile">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="stat-content-profile">
                  <span className="stat-value-profile">{currentUser.favorites?.length || 0}</span>
                  <span className="stat-label-profile">Phim yêu thích</span>
                </div>
              </div>

              <div className="profile-stat-card history-stat">
                <div className="stat-icon-profile">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="stat-content-profile">
                  <span className="stat-value-profile">{currentUser.history?.length || 0}</span>
                  <span className="stat-label-profile">Phim đã xem</span>
                </div>
              </div>
            </div>

            {/* Account Info Card */}
            <div className="account-info-card">
              <div className="info-card-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>Thông tin tài khoản</h3>
              </div>

              <div className="info-rows">
                <div className="info-row">
                  <div className="info-label">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeWidth="2"/>
                    </svg>
                    Họ tên
                  </div>
                  <div className="info-value">{currentUser.name}</div>
                </div>

                <div className="info-row">
                  <div className="info-label">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeWidth="2"/>
                      <polyline points="22,6 12,13 2,6" strokeWidth="2"/>
                    </svg>
                    Email
                  </div>
                  <div className="info-value">{currentUser.email}</div>
                </div>

                <div className="info-row">
                  <div className="info-label">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8v6M23 11h-6" strokeWidth="2"/>
                    </svg>
                    Vai trò
                  </div>
                  <div className="info-value">
                    {currentUser.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-label">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2"/>
                    </svg>
                    ID Người dùng
                  </div>
                  <div className="info-value info-id">#{currentUser.id}</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="profile-actions-grid">
              <button className="action-btn favorites-btn" onClick={() => navigate('/my-favorites')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="2"/>
                </svg>
                Danh sách yêu thích
              </button>
              <button className="action-btn history-btn" onClick={() => navigate('/my-history')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeWidth="2"/>
                </svg>
                Lịch sử xem
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
