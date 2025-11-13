import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext.jsx';
import { movieApi } from '../utils/movieApi.js';
import { SearchBar } from '../components/SearchBar.jsx';
import { Header } from '../components/Header.jsx';
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
  const [showPlayer, setShowPlayer] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

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
        console.log('Movie loaded:', movieData); // Debug log

        // Check favorite status from API
        const token = localStorage.getItem('token');
        console.log('Token found:', !!token);
        
        if (token) {
          const movieSlug = movieData.slug || movieData.id;
          console.log('Checking favorite for slug:', movieSlug);
          
          try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const favoriteUrl = `${API_BASE_URL}/api/auth/favorites/${movieSlug}`;
            console.log('Favorite API URL:', favoriteUrl);
            
            const favoriteResponse = await fetch(favoriteUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            console.log('Favorite response status:', favoriteResponse.status, favoriteResponse.ok);

            if (favoriteResponse.ok) {
              const favoriteData = await favoriteResponse.json();
              console.log('✅ Favorite status API response:', favoriteData);
              setIsFavorite(favoriteData.isFavorited || false);
            } else {
              console.warn('❌ Favorite API returned non-ok status:', favoriteResponse.status);
              const errorText = await favoriteResponse.text();
              console.warn('Error response:', errorText);
            }
          } catch (favoriteErr) {
            console.error('❌ Error checking favorite status:', favoriteErr);
          }
        } else {
          console.log('No token found, skipping favorite check');
        }
      } catch (err) {
        console.error('Error fetching movie detail:', err);
        setError('Không thể tải thông tin phim. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetail();
  }, [id]);

  // Search functionality - use API
  useEffect(() => {
    if (searchQuery.trim()) {
      const fetchSearchResults = async () => {
        setSearchLoading(true);
        try {
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          const keyword = encodeURIComponent(searchQuery);
          const response = await fetch(`${API_BASE_URL}/api/search?keyword=${keyword}&page=1&limit=20`);
          
          console.log('Search API response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Search results from API:', data);
            
            // Handle different response formats
            const results = Array.isArray(data) ? data : (data.items || data.results || []);
            
            // Normalize results to match UI expectations
            const normalizedResults = results.map(m => ({
              id: m._id || m.id,
              title: m.name || m.title,
              poster: m.poster_url || m.thumb_url || m.poster,
              rating: m.rating || 0,
              year: m.year,
              duration: m.time || m.duration,
              description: m.content || m.description,
              slug: m.slug,
            })).filter(Boolean);
            
            setSearchResults(normalizedResults);
          } else {
            console.warn('❌ Search API failed:', response.status);
            setSearchResults([]);
          }
        } catch (err) {
          console.error('❌ Error searching:', err);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      };
      
      fetchSearchResults();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearchResultClick = (movie) => {
    navigate(`/movie/${movie.slug || movie.id}`);
    setShowSearch(false);
    setSearchQuery('');
  };

  const handleFavorite = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('token');
    
    console.log('🔄 handleFavorite called:', { isFavorite, token: !!token, movie: movie?.slug });
    
    if (!token) {
      console.error('❌ No token found, user must be logged in');
      return;
    }

    if (!movie) {
      console.error('❌ No movie data available');
      return;
    }

    try {
      const movieSlug = movie.slug || movie.id;
      const method = isFavorite ? 'DELETE' : 'POST';
      const url = `${API_BASE_URL}/api/auth/favorites/${movieSlug}`;
      
      console.log(`📤 Making ${method} request to:`, url);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📥 Response status:', response.status, response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', data);
      
      if (data.success || response.ok) {
        setIsFavorite(!isFavorite);
        console.log('✅ Favorite status updated:', !isFavorite);
      }
    } catch (err) {
      console.error('❌ Error toggling favorite:', err.message);
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
    <div className="MOIVE-home">
      {/* Header */}
      <Header 
        scrolled={true}
        showSearch={true}
        onSearchClick={() => setShowSearch(true)}
        isHomePage={true}
      />

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
              <button className="btn-play" onClick={() => setShowPlayer(true)}>
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
                  {Array.isArray(movie.country)
                    ? movie.country.map(c => c.name || c).join(', ')
                    : movie.country || 'N/A'
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

      {/* Search Modal */}
      {showSearch && (
        <div 
          className="search-modal-overlay" 
          onClick={() => setShowSearch(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '80px',
          }}
        >
          <div 
            className="search-modal" 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#181818',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '800px',
              padding: '28px',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
              border: '1px solid #2a2a2a',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #2a2a2a' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#e5e5e5', fontWeight: '700' }}>🔍 Tìm kiếm phim</h2>
              <button 
                onClick={() => setShowSearch(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#e5e5e5',
                  transition: 'transform 0.2s ease',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => e.target.style.transform = 'rotate(90deg)'}
                onMouseLeave={(e) => e.target.style.transform = 'rotate(0)'}
              >
                ✕
              </button>
            </div>

            <SearchBar
              query={searchQuery}
              onChange={setSearchQuery}
              results={searchResults}
              isLoading={searchLoading}
              showResults={true}
              placeholder="Tìm kiếm phim, đạo diễn, diễn viên..."
              title=""
              description=""
              variant="dark"
              onResultClick={handleSearchResultClick}
            />
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {showPlayer && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setShowPlayer(false)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '1200px',
              aspectRatio: '16 / 9',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPlayer(false)}
              style={{
                position: 'absolute',
                top: '-50px',
                right: 0,
                backgroundColor: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '32px',
                cursor: 'pointer',
                zIndex: 1001,
                padding: '0',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close"
            >
              ✕
            </button>

            {/* Video Player - YouTube or Cloudinary */}
            {movie.trailer && (movie.trailer.includes('youtube.com') || movie.trailer.includes('youtu.be')) ? (
              // YouTube Player
              <iframe
                src={
                  (() => {
                    let videoId = '';
                    if (movie.trailer.includes('youtu.be')) {
                      // Format: https://youtu.be/VIDEO_ID
                      videoId = movie.trailer.split('/').pop().split('?')[0];
                    } else if (movie.trailer.includes('youtube.com')) {
                      // Format: https://www.youtube.com/watch?v=VIDEO_ID&...
                      const url = new URL(movie.trailer);
                      videoId = url.searchParams.get('v');
                    }
                    return `https://www.youtube.com/embed/${videoId}`;
                  })()
                }
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px',
                }}
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                frameBorder="0"
                title={movie.name}
              />
            ) : (
              // Cloudinary Player
              <iframe
                src={`https://player.cloudinary.com/embed/?cloud_name=dcmzsjorh&public_id=${movie.trailer || movie.trailerUrl || 'movies%2Fvideos%2Fdklmszvyfq0jdaypm9kh'}&profile=cld-default`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px',
                }}
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                frameBorder="0"
                title={movie.name}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
