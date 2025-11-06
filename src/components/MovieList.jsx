import React from 'react';
import './panel.css';

const SKELETON_ITEMS = Array.from({ length: 6 });

export const MovieList = ({
  id,
  movies,
  genres,
  actors,
  onSelect,
  favorites,
  loading,
  error,
}) => {
  const genreMap = Object.fromEntries(genres.map((genre) => [genre.id, genre.name]));
  const actorMap = Object.fromEntries(actors.map((actor) => [actor.id, actor.name]));

  if (loading) {
    return (
      <div className="panel" id={id}>
        <h3>Kết quả</h3>
        <div className="movie-grid">
          {SKELETON_ITEMS.map((_, index) => (
            <div className="movie-card skeleton" key={index}>
              <div className="skeleton-image" />
              <div className="movie-card-content">
                <div className="skeleton-line skeleton-line--lg" />
                <div className="skeleton-line" />
                <div className="skeleton-line" />
                <div className="skeleton-line skeleton-line--sm" />
                <div className="skeleton-line skeleton-line--sm" />
                <div className="skeleton-line skeleton-line--xs" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel" id={id}>
        <h3>Kết quả</h3>
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="panel" id={id}>
        <h3>Kết quả</h3>
        <p>Không tìm thấy phim phù hợp.</p>
      </div>
    );
  }

  return (
    <div className="panel" id={id}>
      <h3>Kết quả ({movies.length})</h3>
      <div className="movie-grid">
        {movies.map((movie) => (
          <div className="movie-card" key={movie.id}>
            <img src={movie.poster} alt={movie.title} loading="lazy" />
            <div className="movie-card-content">
              <h4>{movie.title}</h4>
              <div className="tag-list">
                <span className="tag">{movie.year}</span>
                <span className="tag">{movie.country}</span>
                {movie.genres.map((genreId) => (
                  <span className="tag" key={genreId}>
                    {genreMap[genreId] || 'Khác'}
                  </span>
                ))}
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{movie.description}</p>
              <p style={{ fontSize: '0.85rem' }}>
                Đạo diễn: <strong>{movie.director}</strong>
              </p>
              <p style={{ fontSize: '0.85rem' }}>
                Diễn viên:{' '}
                <strong>{movie.cast.map((id) => actorMap[id]).join(', ')}</strong>
              </p>
              <div className="actions-row">
                <button className="primary" onClick={() => onSelect(movie)}>
                  Xem chi tiết
                </button>
                {favorites.includes(movie.id) && <span className="badge">Yêu thích</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
