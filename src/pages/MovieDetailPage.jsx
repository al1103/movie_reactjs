import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext.jsx';
import { movieApi } from '../utils/movieApi.js';
import './pages-modern.css';

const formatDate = (timestamp) => new Date(timestamp).toLocaleString('vi-VN');

const getStatusBadgeColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return '#10b981';
    case 'ongoing':
      return '#f59e0b';
    case 'coming_soon':
      return '#6366f1';
    default:
      return '#6b7280';
  }
};

const getStatusText = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'Hoàn thành';
    case 'ongoing':
      return 'Đang chiếu';
    case 'coming_soon':
      return 'Sắp chiếu';
    default:
      return status || 'N/A';
  }
};


export const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, toggleFavorite, logout } = useAppData();

  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch movie detail from API
  useEffect(() => {
    if (!id) return;

    const fetchMovieDetail = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await movieApi.getMovieBySlug(id);
        // API returns { movie: {...} } so we extract movie object
        const movieData = response.movie || response;
        setMovie(movieData);
        setIsFavorite(currentUser?.favorites?.includes(movieData.slug) || false);
        console.log('Movie loaded:', movieData); // Debug log
      } catch (err) {
        console.error('Error fetching movie detail:', err);
        setError('Không thể tải thông tin phim. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetail();
  }, [id, currentUser?.favorites]);

  const handleFavorite = () => {
    try {
      toggleFavorite(movie?.slug);
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="page-stack">
        <section className="hero-panel hero-panel--compact">
          <h1>Đang tải thông tin phim...</h1>
          <p>Vui lòng chờ một chút</p>
        </section>
        <div className="panel page-empty">
          <div className="loading-spinner"></div>
          <strong>Đang lấy thông tin phim từ API...</strong>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-stack">
        <section className="hero-panel hero-panel--compact">
          <h1>Lỗi tải phim</h1>
          <p>{error}</p>
        </section>
        <div className="panel page-empty">
          <button
            className="primary"
            onClick={() => navigate('/')}
            style={{ marginTop: '1rem' }}
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="page-stack">
        <section className="hero-panel hero-panel--compact">
          <h1>Không tìm thấy phim</h1>
          <p>Rất tiếc, phim bạn tìm kiếm không tồn tại.</p>
        </section>
        <div className="panel page-empty">
          <strong>Phim không tồn tại</strong>
          <button
            className="primary"
            onClick={() => navigate('/')}
            style={{ marginTop: '1rem' }}
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="netflix-home">
      {/* Header */}
      <header className="netflix-header scrolled">
        <div className="header-left">
          <div className="netflix-logo" onClick={() => navigate('/')}>NETFLIX</div>
          <nav className="header-nav">
            <button onClick={() => navigate('/')} className="nav-link">Home</button>
            <button onClick={() => navigate('/')} className="nav-link">TV Shows</button>
            <button onClick={() => navigate('/')} className="nav-link">Movies</button>
            <button onClick={() => navigate(currentUser ? '/my-favorites' : '/auth')} className="nav-link">My List</button>
          </nav>
        </div>
        <div className="header-right">
          <button className="icon-btn search-btn" title="Search">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          {currentUser && (
            <button className="icon-btn notification-btn" title="Notifications">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 17H20L18.595 15.595C18.4063 15.4063 18.3 15.1513 18.3 14.885V11C18.3 8.61305 16.7305 6.57 14.55 5.795C14.2672 4.77154 13.3873 4 12.3 4C11.2127 4 10.3328 4.77154 10.05 5.795C7.86954 6.57 6.3 8.61305 6.3 11V14.885C6.3 15.1513 6.19373 15.4063 6.005 15.595L4.6 17H9.3M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <div className="user-menu">
            <div className="user-profile">
              <img src="https://i.pravatar.cc/40" alt="User" />
            </div>
            <div className="user-dropdown">
              {currentUser ? (
                <>
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
                </>
              ) : (
                <button onClick={() => navigate('/auth')} className="dropdown-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" strokeWidth="2"/>
                  </svg>
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Movie Detail Content */}
      <div className="movie-detail-page">
        {/* Hero Section with Movie Banner */}
        <div className="movie-detail-hero">
          <div className="movie-detail-backdrop">
            <img src={movie.poster_url || movie.thumb_url} alt={movie.name} />
            <div className="movie-detail-gradient"></div>
          </div>

          <div className="movie-detail-info">
            <button onClick={() => navigate('/')} className="back-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Quay lại
            </button>

            <h1 className="movie-detail-title">{movie.name}</h1>
            {movie.origin_name && <p className="movie-origin-name">{movie.origin_name}</p>}

            <div className="movie-detail-meta">
              <span className="meta-item rating">★ {movie.rating || 0}</span>
              <span className="meta-item">{movie.year}</span>
              <span className="meta-item">{movie.time}</span>
              <span
                className="meta-item status-badge"
                style={{ backgroundColor: getStatusBadgeColor(movie.status) }}
              >
                {getStatusText(movie.status)}
              </span>
            </div>

            <p className="movie-detail-description">{movie.content}</p>

            {/* Categories/Genres */}
            <div className="movie-detail-genres">
              {movie.category && movie.category.length > 0 && movie.category.map((cat, idx) => (
                <span key={idx} className="genre-badge">
                  {cat.name}
                </span>
              ))}
            </div>

            <div className="movie-detail-actions">
              <button className="btn-play">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                PHÁT NGAY
              </button>
              <button
                className={`btn-add ${isFavorite ? 'active' : ''}`}
                onClick={handleFavorite}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Movie Details Section */}
        <div className="movie-detail-content">
          <div className="content-section">
            <h2 className="section-heading">Chi tiết phim</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Loại</span>
                <span className="detail-value">{movie.type || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Chất lượng</span>
                <span className="detail-value">{movie.quality || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ngôn ngữ</span>
                <span className="detail-value">{movie.lang || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Năm phát hành</span>
                <span className="detail-value">{movie.year || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Đạo diễn</span>
                <span className="detail-value">
                  {Array.isArray(movie.director) ? movie.director.join(', ') : movie.director || 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Diễn viên</span>
                <span className="detail-value">
                  {Array.isArray(movie.actor) ? movie.actor.join(', ') : movie.actor || 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Quốc gia</span>
                <span className="detail-value">
                  {movie.country && movie.country.length > 0
                    ? movie.country.map(c => c.name).join(', ')
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Thể loại</span>
                <span className="detail-value">
                  {movie.category && movie.category.length > 0
                    ? movie.category.map(c => c.name).join(', ')
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Episode Information */}
          {(movie.episode_current || movie.episode_total) && (
            <div className="content-section">
              <h2 className="section-heading">Thông tin tập phim</h2>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Tập hiện tại</span>
                  <span className="detail-value">{movie.episode_current || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tổng tập</span>
                  <span className="detail-value">{movie.episode_total || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Thời lượng/tập</span>
                  <span className="detail-value">{movie.time || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Trạng thái</span>
                  <span
                    className="detail-value"
                    style={{ color: getStatusBadgeColor(movie.status) }}
                  >
                    {getStatusText(movie.status)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="content-section">
            <h2 className="section-heading">Thông tin bổ sung</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Lượt xem</span>
                <span className="detail-value">{(movie.view || 0).toLocaleString('vi-VN')}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Đánh giá</span>
                <span className="detail-value">
                  ★ {movie.rating || 0} / 10
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Bản quyền</span>
                <span className="detail-value">
                  {movie.is_copyright ? '✓ Có bản quyền' : '✗ Không xác định'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phim chiếu rạp</span>
                <span className="detail-value">
                  {movie.chieurap ? '✓ Có' : '✗ Không'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="content-section">
            <h2 className="section-heading">Mô tả chi tiết</h2>
            <p className="detail-description-text">
              {movie.content}
            </p>
          </div>

          {/* IMDb/TMDB */}
          {(movie.imdb || movie.tmdb) && (
            <div className="content-section">
              <h2 className="section-heading">Liên kết ngoài</h2>
              <div className="external-links">
                {movie.imdb && (
                  <a href={`https://imdb.com/title/${movie.imdb.id}`} target="_blank" rel="noreferrer" className="external-link">
                    IMDb: {movie.imdb.id}
                  </a>
                )}
                {movie.tmdb && (
                  <a href={`https://themoviedb.org/movie/${movie.tmdb.id}`} target="_blank" rel="noreferrer" className="external-link">
                    TMDB: {movie.tmdb.id}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
