import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext.jsx';
import './pages-modern.css';

export const UserFavoritesPage = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    state: { movies },
    logout,
  } = useAppData();

  const favoriteMovies = useMemo(() => {
    if (!currentUser?.favorites) return [];
    return movies.filter((movie) => currentUser.favorites.includes(movie.id));
  }, [currentUser?.favorites, movies]);

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
            <button onClick={() => navigate('/my-favorites')} className="nav-link active">My List</button>
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
          <h1>❤️ Danh sách yêu thích</h1>
          <p>Những bộ phim bạn đã lưu vào tủ yêu thích của mình ({favoriteMovies.length} phim).</p>
        </div>
        <div className="movies-section">
          {favoriteMovies.length ? (
            <div className="movies-grid">
              {favoriteMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="movie-card"
                  onClick={() => navigate(`/movie/${movie.id}`)}
                >
                  <img src={movie.poster} alt={movie.title} loading="lazy" />
                  <div className="movie-info">
                    <h3>{movie.title}</h3>
                    <div className="movie-meta">
                      <span className="movie-rating">★ {movie.rating}</span>
                      <span>{movie.year}</span>
                    </div>
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
              <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Bạn chưa thêm phim nào vào yêu thích</h3>
              <p style={{ marginBottom: '24px' }}>Hãy tìm những bộ phim bạn thích và nhấn nút ❤️ để lưu!</p>
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
