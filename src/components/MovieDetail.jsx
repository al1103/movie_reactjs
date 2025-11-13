import { useEffect, useMemo, useState } from 'react';
import { useAppData } from '../context/AppDataContext.jsx';
import { Toast, useToast } from './Toast';
import './panel.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const formatDate = (timestamp) => new Date(timestamp).toLocaleString();

export const MovieDetail = ({ movie, genres, actors, suggestions, onClose }) => {
  const { currentUser, recordView, addRating } = useAppData();
  const { toasts, show: showToast, remove: removeToast } = useToast();
  const [score, setScore] = useState(5);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [checking, setChecking] = useState(false);

  const genreMap = useMemo(() => Object.fromEntries(genres.map((item) => [item.id, item.name])), [
    genres,
  ]);
  const actorMap = useMemo(() => Object.fromEntries(actors.map((item) => [item.id, item.name])), [
    actors,
  ]);

  // ========== Check if movie is favorited ==========
  const checkFavoriteStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('checkFavoriteStatus - token:', !!token, 'movie:', movie?.id, 'slug:', movie?.slug);
      
      if (!token) {
        console.log('No token, skipping favorite check');
        return;
      }

      setChecking(true);
      const movieSlug = movie.slug || movie.id;
      console.log('Checking favorite status for:', movieSlug);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/favorites/${movieSlug}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Favorite API response status:', response.status, response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Favorite check response:', data);
        setIsFavorited(data.isFavorited || false);
      } else {
        console.warn('Favorite API error:', response.statusText);
      }
    } catch (err) {
      console.error('Error checking favorite status:', err);
    } finally {
      setChecking(false);
    }
  };

  // ========== Check favorite status on mount/movie change ==========
  useEffect(() => {
    if (movie) {
      console.log('useEffect triggered - movie:', movie?.id, 'currentUser:', currentUser?.username);
      checkFavoriteStatus();
    }
  }, [movie?.id]);

  useEffect(() => {
    if (movie) {
      recordView(movie.id);
    }
  }, [movie, recordView]);

  useEffect(() => {
    setScore(5);
    setError('');
    setMessage('');
  }, [movie?.id]);

  if (!movie) return null;

  const handleRating = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      addRating(movie.id, Number(score));
      setMessage('Cảm ơn bạn đã đánh giá!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCommentOnly = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
  };

  // ========== Toggle Favorite via API ==========
  const handleFavorite = async () => {
    console.log('handleFavorite called, isFavorited:', isFavorited, 'currentUser:', currentUser?.username);
    setError('');
    setMessage('');
    
    if (!currentUser) {
      setError('Vui lòng đăng nhập để thêm yêu thích');
      showToast('❌ Vui lòng đăng nhập', 'error');
      return;
    }

    try {
      const movieSlug = movie.slug || movie.id;
      console.log('Movie slug:', movieSlug, 'Movie object:', movie);
      
      const method = isFavorited ? 'DELETE' : 'POST';
      const url = `${API_BASE_URL}/api/auth/favorites/${movieSlug}`;
      console.log(`Making ${method} request to:`, url);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log('Response status:', response.status, response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update favorite');
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success) {
        setIsFavorited(!isFavorited);
        const msg = !isFavorited ? 'Đã thêm vào yêu thích' : 'Đã bỏ khỏi yêu thích';
        showToast(`✅ ${msg}`, 'success');
      }
    } catch (err) {
      console.error('Error in handleFavorite:', err);
      setError(err.message);
      showToast(`❌ Lỗi: ${err.message}`, 'error');
    }
  };

  return (
    <>
      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{movie.title}</h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b' }}
          >
            Đóng
          </button>
        </div>
        <div
          style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          }}
        >
          <img
            src={movie.banner || movie.poster}
            alt={movie.title}
            style={{ width: '100%', borderRadius: '16px', objectFit: 'cover' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#374151' }}>{movie.description}</p>
            <div className="tag-list">
              <span className="tag">{movie.year}</span>
              {movie.country && (
                <>
                  {Array.isArray(movie.country) ? movie.country.map(c => (
                    <span className="tag" key={c.slug}>{c.name}</span>
                  )) : <span className="tag">{movie.country}</span>}
                </>
              )}
              <span className="tag">{movie.duration || 'N/A'}</span>
              {movie.category && Array.isArray(movie.category) && movie.category.map((cat) => (
                <span className="tag" key={cat.slug}>
                  {cat.name}
                </span>
              ))}
            </div>
            <p>
              Đạo diễn: <strong>{Array.isArray(movie.director) ? movie.director.join(', ') : movie.director || 'N/A'}</strong>
            </p>
            <p>
              Diễn viên: <strong>{Array.isArray(movie.actor) ? movie.actor.join(', ') : movie.actor || 'N/A'}</strong>
            </p>
            <p>
              Điểm trung bình: <strong>{(movie.rating || 0).toFixed(1)}</strong> ({(movie.ratings || []).length} đánh giá)
            </p>
            <p>Lượt xem: {(movie.views || 0).toLocaleString('vi-VN')}</p>
            <div className="actions-row">
              <button className="primary" onClick={handleFavorite} disabled={checking || !currentUser}>
                {checking ? 'Đang xử lý...' : isFavorited ? '❤️ Bỏ yêu thích' : '🤍 Thêm yêu thích'}
              </button>
              <a className="primary" href={movie.trailer} target="_blank" rel="noreferrer">
                Xem trailer
              </a>
            </div>
          </div>
        </div>

        {movie.episode_total && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3>Thông tin tập phim</h3>
            <p>Tập hiện tại: <strong>{movie.episode_current}</strong></p>
            <p>Tổng tập: <strong>{movie.episode_total}</strong></p>
            <p>Trạng thái: <strong>{movie.status}</strong></p>
          </div>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <h3>Đánh giá & bình luận</h3>
          {currentUser ? (
            <form className="panel-form" onSubmit={handleRating}>
              <label>
                Điểm (1-5)
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  value={score}
                  onChange={(event) => setScore(event.target.value)}
                />
              </label>
              <div className="actions-row">
                <button className="primary" type="submit">
                  Gửi đánh giá
                </button>
              </div>
            </form>
          ) : (
            <p style={{ color: '#64748b' }}>Đăng nhập để đánh giá.</p>
          )}
          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}
        </div>
      </div>

      {suggestions?.length ? (
        <div className="panel" style={{ marginTop: '1rem' }}>
          <h3>Đề xuất tương tự</h3>
          <ul>
            {suggestions.map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
};
