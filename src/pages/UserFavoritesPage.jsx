import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext.jsx';
import { UserHeader } from '../components/UserHeader.jsx';
import './pages-modern.css';

export const UserFavoritesPage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAppData();
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch favorites from API
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');

        if (!token) {
          console.log('No token found, cannot fetch favorites');
          setLoading(false);
          return;
        }

        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_BASE_URL}/api/auth/favorites`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('Favorites API response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Favorites fetched from API:', data);

          // Handle both array and { success, favorites: [...] } response formats
          const favorites = Array.isArray(data) ? data : (data.favorites || []);
          
          // Map to movie objects - API returns { movieId: {...} } or similar
          const movieList = favorites.map((item) => {
            // Handle different response formats
            if (item.movieId && typeof item.movieId === 'object') {
              // Format: { _id, movieId: { name, poster_url, ... } }
              return {
                id: item.movieId._id || item._id,
                title: item.movieId.name,
                poster: item.movieId.poster_url || item.movieId.thumb_url,
                rating: item.movieId.rating || 0,
                year: item.movieId.year,
                slug: item.movieId.slug,
              };
            } else if (item.name || item.title) {
              // Direct movie object
              return {
                id: item._id || item.id,
                title: item.name || item.title,
                poster: item.poster_url || item.thumb_url || item.poster,
                rating: item.rating || 0,
                year: item.year,
                slug: item.slug,
              };
            }
            return null;
          }).filter(Boolean);

          setFavoriteMovies(movieList);
        } else {
          console.warn('❌ Failed to fetch favorites:', response.status);
          setError('Không thể tải danh sách yêu thích');
        }
      } catch (err) {
        console.error('❌ Error fetching favorites:', err);
        setError('Lỗi khi tải danh sách yêu thích');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="MOIVE-home">
      <UserHeader scrolled={true} />

      <div className="admin-content">
        <div className="admin-hero">
          <h1>❤️ Danh sách yêu thích</h1>
          <p>Những bộ phim bạn đã lưu vào tủ yêu thích của mình ({loading ? '...' : favoriteMovies.length} phim).</p>
        </div>
        <div className="movies-section">
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#b3b3b3'
            }}>
              <div className="loading-spinner"></div>
              <p>Đang tải danh sách yêu thích...</p>
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#ef4444'
            }}>
              <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Lỗi</h3>
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-play"
                style={{ display: 'inline-flex', marginTop: '16px' }}
              >
                Thử lại
              </button>
            </div>
          ) : favoriteMovies.length > 0 ? (
            <div className="movies-grid">
              {favoriteMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="movie-card"
                  onClick={() => navigate(`/movie/${movie.slug || movie.id}`)}
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
