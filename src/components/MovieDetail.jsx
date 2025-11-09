import { useEffect, useMemo, useState } from 'react';
import { useAppData } from '../context/AppDataContext.jsx';
import './panel.css';

const formatDate = (timestamp) => new Date(timestamp).toLocaleString();

export const MovieDetail = ({ movie, genres, actors, suggestions, onClose }) => {
  const { currentUser, toggleFavorite, recordView, addRating, addComment } = useAppData();
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const genreMap = useMemo(() => Object.fromEntries(genres.map((item) => [item.id, item.name])), [
    genres,
  ]);
  const actorMap = useMemo(() => Object.fromEntries(actors.map((item) => [item.id, item.name])), [
    actors,
  ]);

  useEffect(() => {
    if (movie) {
      recordView(movie.id);
    }
  }, [movie, recordView]);

  useEffect(() => {
    setScore(5);
    setComment('');
    setError('');
    setMessage('');
  }, [movie?.id]);

  if (!movie) return null;

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

  return (
    <>
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
              <button className="primary" onClick={handleFavorite}>
                {isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
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
              <label>
                Nội dung
                <textarea
                  rows="3"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn..."
                />
              </label>
              <div className="actions-row">
                <button className="primary" type="submit">
                  Gửi đánh giá
                </button>
                <button className="primary" type="button" onClick={handleCommentOnly}>
                  Gửi bình luận
                </button>
              </div>
            </form>
          ) : (
            <p style={{ color: '#64748b' }}>Đăng nhập để đánh giá hoặc bình luận.</p>
          )}
          {error && <p className="error">{error}</p>}
          {message && <p className="success">{message}</p>}
          <div className="comment-list" style={{ marginTop: '1rem' }}>
            {movie.comments.map((item) => (
              <div className="comment-item" key={item.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{item.userName}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                {item.hidden ? (
                  <p style={{ color: '#64748b', fontStyle: 'italic' }}>
                    Bình luận đã bị ẩn bởi quản trị viên.
                  </p>
                ) : (
                  <p>{item.text}</p>
                )}
              </div>
            ))}
          </div>
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
