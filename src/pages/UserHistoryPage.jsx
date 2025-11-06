import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext.jsx';
import './pages-modern.css';

export const UserHistoryPage = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    state: { movies },
    logout,
  } = useAppData();

  const historyWithMovies = useMemo(() => {
    if (!currentUser?.history) return [];
    const map = Object.fromEntries(movies.map((movie) => [movie.id, movie]));
    return currentUser.history
      .map((item) => ({
        ...item,
        movie: map[item.movieId],
      }))
      .filter((item) => item.movie)
      .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt));
  }, [currentUser?.history, movies]);

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
            <button onClick={() => navigate('/my-history')} className="nav-link active">History</button>
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
          <h1>📜 Lịch sử xem phim</h1>
          <p>Danh sách những bộ phim bạn đã xem gần đây ({historyWithMovies.length} phim).</p>
        </div>
        <div className="admin-panel">
          {historyWithMovies.length ? (
            <div style={{ display: 'grid', gap: '20px' }}>
              {historyWithMovies.map((item) => (
                <div
                  key={`${item.movieId}-${item.viewedAt}`}
                  onClick={() => navigate(`/movie/${item.movieId}`)}
                  style={{
                    display: 'flex',
                    gap: '20px',
                    padding: '20px',
                    borderRadius: '8px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#222';
                    e.currentTarget.style.borderColor = '#e50914';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a1a1a';
                    e.currentTarget.style.borderColor = '#2a2a2a';
                  }}
                >
                  <img
                    src={item.movie.poster}
                    alt={item.movie.title}
                    style={{
                      width: '100px',
                      height: '150px',
                      borderRadius: '4px',
                      objectFit: 'cover',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '20px' }}>
                      {item.movie.title}
                    </h3>
                    <p style={{ margin: '0 0 8px 0', color: '#b3b3b3', fontSize: '14px' }}>
                      {item.movie.year} • {item.movie.country} • {item.movie.duration} phút
                    </p>
                    <p style={{ margin: '0 0 12px 0', color: '#e5e5e5', fontSize: '14px', lineHeight: '1.5' }}>
                      {item.movie.description}
                    </p>
                    <p style={{ margin: 0, color: '#808080', fontSize: '13px' }}>
                      Xem lúc: {new Date(item.viewedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#b3b3b3'
            }}>
              <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Bạn chưa xem phim nào</h3>
              <p style={{ marginBottom: '24px' }}>Hãy đi khám phá những bộ phim thú vị!</p>
              <button
                onClick={() => navigate('/')}
                className="btn-play"
                style={{ display: 'inline-flex' }}
              >
                Khám phá phim
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
