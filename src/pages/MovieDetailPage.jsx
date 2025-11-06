import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext.jsx';
import './pages-modern.css';

const formatDate = (timestamp) => new Date(timestamp).toLocaleString('vi-VN');

export const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentUser,
    state: { movies, genres, actors },
    toggleFavorite,
    recordView,
    addRating,
    addComment,
    logout,
  } = useAppData();

  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const movie = useMemo(() => movies.find((m) => m.id === id), [movies, id]);

  const genreMap = useMemo(() => Object.fromEntries(genres.map((item) => [item.id, item.name])), [genres]);
  const actorMap = useMemo(() => Object.fromEntries(actors.map((item) => [item.id, item.name])), [actors]);

  const suggestions = useMemo(() => {
    if (!movie) return [];
    const sameGenre = new Set(movie.genres);
    const sameActors = new Set(movie.cast);
    return movies
      .filter((m) => m.id !== movie.id)
      .map((m) => {
        const genreOverlap = m.genres.some((id) => sameGenre.has(id));
        const actorOverlap = m.cast.some((id) => sameActors.has(id));
        const score = (genreOverlap ? 1 : 0) + (actorOverlap ? 1 : 0);
        return { movie: m, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.movie);
  }, [movie, movies]);

  useEffect(() => {
    if (movie?.id) {
      recordView(movie.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie?.id]);

  useEffect(() => {
    setScore(5);
    setComment('');
    setError('');
    setMessage('');
  }, [movie?.id]);

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

  const favorites = currentUser?.favorites || [];
  const isFavorite = favorites.includes(movie.id);

  const handleRating = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      addRating(movie.id, Number(score), comment);
      setMessage('Cảm ơn bạn đã đánh giá!');
      setComment('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCommentOnly = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      addComment(movie.id, comment);
      setMessage('Đã gửi bình luận');
      setComment('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFavorite = () => {
    setError('');
    setMessage('');
    try {
      toggleFavorite(movie.id);
      setMessage(isFavorite ? 'Đã bỏ khỏi danh sách yêu thích' : 'Đã thêm vào yêu thích');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

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
            <img src={movie.banner || movie.poster} alt={movie.title} />
            <div className="movie-detail-gradient"></div>
          </div>

          <div className="movie-detail-info">
            <button onClick={() => navigate('/')} className="back-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Quay lại
            </button>

            <h1 className="movie-detail-title">{movie.title}</h1>

            <div className="movie-detail-meta">
              <span className="meta-item rating">★ {movie.rating.toFixed(1)}</span>
              <span className="meta-item">{movie.year}</span>
              <span className="meta-item">{movie.duration} phút</span>
              <span className="meta-item">{movie.country}</span>
            </div>

            <p className="movie-detail-description">{movie.description}</p>

            <div className="movie-detail-genres">
              {movie.genres.map((genreId) => (
                <span key={genreId} className="genre-badge">
                  {genreMap[genreId] || 'Khác'}
                </span>
              ))}
            </div>

            <div className="movie-detail-actions">
              <button className="btn-play" onClick={() => movie.trailer && window.open(movie.trailer, '_blank')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                {movie.trailer ? 'XEM TRAILER' : 'PHÁT'}
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
                <span className="detail-label">Đạo diễn</span>
                <span className="detail-value">{movie.director}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Diễn viên</span>
                <span className="detail-value">{movie.cast.map((id) => actorMap[id]).join(', ') || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Đánh giá</span>
                <span className="detail-value">{movie.rating.toFixed(1)}/5 ({movie.ratings.length} đánh giá)</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Lượt xem</span>
                <span className="detail-value">{movie.views?.toLocaleString('vi-VN') || 0}</span>
              </div>
            </div>
          </div>

          {/* Episodes */}
          {movie.episodes?.length ? (
            <div className="content-section">
              <h2 className="section-heading">Danh sách tập ({movie.episodes.length})</h2>
              <div className="episodes-grid">
                {movie.episodes.map((episode) => (
                  <div key={episode.id} className="episode-card">
                    <p className="episode-title">{episode.title}</p>
                    <p className="episode-duration">⏱️ {episode.duration} phút</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Ratings & Comments */}
          <div className="content-section ratings-section">
            <div className="section-header-fancy">
              <h2 className="section-heading">
                <svg className="section-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Đánh giá & bình luận
              </h2>
              <div className="rating-summary">
                <div className="avg-rating">
                  <span className="rating-number">{movie.rating.toFixed(1)}</span>
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill={i < Math.floor(movie.rating) ? "#fbbf24" : "none"} stroke="#fbbf24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth="1.5"/>
                      </svg>
                    ))}
                  </div>
                  <span className="rating-count">{movie.ratings.length} đánh giá</span>
                </div>
              </div>
            </div>

            {currentUser ? (
              <form className="comment-form-modern" onSubmit={handleRating}>
                <div className="user-avatar-section">
                  <div className="avatar-circle">
                    {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{currentUser?.username || 'User'}</span>
                    <span className="user-subtitle">Chia sẻ cảm nhận của bạn</span>
                  </div>
                </div>

                <div className="rating-input-section">
                  <label className="rating-label">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Đánh giá của bạn
                  </label>
                  <div className="star-rating-input">
                    {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        className={`star-btn ${parseFloat(score) >= val ? 'active' : ''}`}
                        onClick={() => setScore(val.toString())}
                      >
                        {val % 1 === 0 ? (
                          <svg width="28" height="28" viewBox="0 0 24 24" fill={parseFloat(score) >= val ? "#fbbf24" : "none"} stroke="#fbbf24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth="1.5"/>
                          </svg>
                        ) : null}
                      </button>
                    ))}
                    <span className="score-display">{score}/5</span>
                  </div>
                </div>

                <div className="comment-input-section">
                  <label className="comment-label">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Nội dung bình luận
                  </label>
                  <textarea
                    className="form-textarea-modern"
                    rows="5"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Hãy chia sẻ suy nghĩ của bạn về bộ phim này... Diễn xuất, cốt truyện, hình ảnh?"
                  />
                </div>

                {error && (
                  <div className="form-message error">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                      <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {error}
                  </div>
                )}
                {message && (
                  <div className="form-message success">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {message}
                  </div>
                )}

                <div className="form-actions-modern">
                  <button className="btn-submit-modern" type="submit">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth="2"/>
                    </svg>
                    Gửi đánh giá
                  </button>
                  <button
                    className="btn-comment-modern"
                    type="button"
                    onClick={handleCommentOnly}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2"/>
                    </svg>
                    Chỉ bình luận
                  </button>
                </div>
              </form>
            ) : (
              <div className="login-prompt-modern">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="9" y1="9" x2="15" y2="9" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="9" y1="13" x2="15" y2="13" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <h3>Tham gia cộng đồng</h3>
                <p>Đăng nhập để đánh giá, bình luận và chia sẻ cảm nhận của bạn về phim này</p>
                <button className="login-btn" onClick={() => navigate('/auth')}>
                  Đăng nhập ngay
                </button>
              </div>
            )}

            {/* Comments List */}
            {movie.comments.length > 0 && (
              <div className="comments-section-modern">
                <div className="comments-header">
                  <h3 className="comments-heading-modern">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {movie.comments.filter((c) => !c.hidden).length} Bình luận
                  </h3>
                </div>
                <div className="comments-list-modern">
                  {movie.comments
                    .filter((c) => !c.hidden)
                    .map((item) => (
                      <div className="comment-card-modern" key={item.id}>
                        <div className="comment-avatar">
                          {item.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="comment-content">
                          <div className="comment-header-modern">
                            <strong className="comment-user-modern">{item.userName}</strong>
                            <span className="comment-date-modern">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                                <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                          <p className="comment-text-modern">{item.text}</p>
                          <div className="comment-actions">
                            <button className="comment-action-btn">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Hữu ích
                            </button>
                            <button className="comment-action-btn">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2"/>
                              </svg>
                              Trả lời
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="movies-section">
            <h2 className="section-title">Phim tương tự</h2>
            <div className="movies-grid">
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  className="movie-card"
                  onClick={() => navigate(`/movie/${item.id}`)}
                >
                  <img src={item.poster} alt={item.title} loading="lazy" />
                  <div className="movie-info">
                    <h3>{item.title}</h3>
                    <div className="movie-meta">
                      <span className="movie-rating">★ {item.rating}</span>
                      <span>{item.year}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
